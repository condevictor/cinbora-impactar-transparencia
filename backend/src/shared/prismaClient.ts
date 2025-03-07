import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

prismaClient.$use(async (params, next) => {
  const result = await next(params);

  if (params.model === 'ActionExpensesGrafic' && ['create', 'update', 'delete'].includes(params.action)) {
    const expense = params.args.data || params.args.where;
    let actionId = expense?.actionId;

    if (!actionId && params.args.where?.id) {
      const actionExpense = await prismaClient.actionExpensesGrafic.findUnique({
        where: { id: params.args.where.id },
      });
      actionId = actionExpense?.actionId;
    }

    if (!actionId) {
      throw new Error('actionId is not defined');
    }

    const action = await prismaClient.action.findUnique({
      where: { id: actionId },
      include: { ngo: true }
    });

    if (action && action.ngo) {
      const ngoId = action.ngo.id;

      // Atualiza o campo spent da Action
      const expensesByAction = await prismaClient.actionExpensesGrafic.findMany({
        where: { actionId: action.id }
      });

      const totalSpent = expensesByAction.reduce((sum, exp) => {
        const categories = exp.categorysExpenses as Record<string, number>;
        return sum + Object.values(categories).reduce((acc, amount) => acc + amount, 0);
      }, 0);

      await prismaClient.action.update({
        where: { id: action.id },
        data: { spent: totalSpent }
      });

      // Atualiza os campos totalExpenses e expensesByCategory do NgoGraphic
      const actions = await prismaClient.action.findMany({
        where: { ngoId }
      });

      let totalExpenses = 0;
      let expensesByCategory: Record<string, number> = {};

      for (const act of actions) {
        const actionExpenses = await prismaClient.actionExpensesGrafic.findMany({
          where: { actionId: act.id }
        });

        actionExpenses.forEach(exp => {
          const categories = exp.categorysExpenses as Record<string, number>;
          for (const [category, amount] of Object.entries(categories)) {
            expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
            totalExpenses += amount;
          }
        });
      }

      await prismaClient.ngoGraphic.update({
        where: { ngoId },
        data: {
          totalExpenses,
          expensesByCategory
        }
      });
    }
  }

  return result;
});

export default prismaClient;