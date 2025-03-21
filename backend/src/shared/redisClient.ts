import NodeCache from "node-cache";

// Cache local em memória
export const localCache = new NodeCache({
  stdTTL: 3600, // 1 hora (3600 segundos)
  checkperiod: 600, // Verificar expiração a cada 10 minutos
  useClones: false, // Evita clonagem profunda
  deleteOnExpire: true, // Limpa automaticamente itens expirados
  maxKeys: 1000 // Limite máximo de chaves
});

// Mapa para rastrear chaves por padrão (para invalidação eficiente)
export const keyPatternMap: Record<string, Set<string>> = {};

// Registrar uma chave com seus possíveis padrões de invalidação
export function registerKey(key: string, patterns: string[] = []) {
  patterns.forEach(pattern => {
    if (!keyPatternMap[pattern]) {
      keyPatternMap[pattern] = new Set();
    }
    keyPatternMap[pattern].add(key);
  });
}

// Remover uma chave de todos os padrões
export function unregisterKey(key: string) {
  Object.values(keyPatternMap).forEach(keys => {
    keys.delete(key);
  });
}

// Interface que corresponde às opções do Redis
interface RedisSetOptions {
  ex?: number;
}

class LocalOnlyRedisClient {
  private keyStore: Set<string> = new Set();
  
  async get(key: string) {
    return localCache.get<any>(key);
  }

  async set(key: string, value: any, options?: RedisSetOptions) {
    this.keyStore.add(key);
    registerKey(key, [`${key.split(':')[0]}:*`]);
    
    if (options?.ex) {
      localCache.set(key, value, options.ex);
    } else {
      localCache.set(key, value);
    }
    return "OK";
  }

  async del(key: string) {
    this.keyStore.delete(key);
    localCache.del(key);
    unregisterKey(key);
    return 1;
  }

  async keys(pattern: string) {
    // Simplificado - apenas funciona para padrões explícitos
    if (keyPatternMap[pattern]) {
      return Array.from(keyPatternMap[pattern]);
    }
    // Fallback para busca simples por prefixo
    return Array.from(this.keyStore).filter(key => 
      key.startsWith(pattern.replace('*', ''))
    );
  }

  async delByPattern(pattern: string) {
    const keys = await this.keys(pattern);
    keys.forEach(key => {
      localCache.del(key);
      unregisterKey(key);
      this.keyStore.delete(key);
    });
    return keys.length;
  }

  async ttl(key: string) {
    const ttl = localCache.getTtl(key);
    return ttl ? Math.floor((ttl - Date.now()) / 1000) : -1;
  }

  async ping() {
    return "PONG";
  }
}

let redisClient: LocalOnlyRedisClient;

try {
  console.log("Inicializando em modo apenas local (sem Redis)");
  redisClient = new LocalOnlyRedisClient();
} catch (error) {
  console.error("Erro ao inicializar o modo apenas local:", error);
  process.exit(1);
}

export default redisClient;
