import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import mime from 'mime';
import { config } from '@config/dotenv';
import { v4 as uuidv4 } from 'uuid';

class S3Storage {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId!,
        secretAccessKey: config.awsSecretAccessKey!,
      },
    });
  }

  /**
   * Codifica caracteres especiais em um nome de arquivo para garantir consistência
   * @param filename Nome do arquivo para codificar
   * @returns Nome do arquivo com caracteres especiais codificados
   */
  private encodeFilename(filename: string): string {
    // Substitui espaços por hífens e remove caracteres problemáticos
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\-\.]/g, '-')      // Substitui caracteres especiais por hífens
      .replace(/\s+/g, '-')            // Substitui espaços por hífens
      .replace(/-+/g, '-')             // Previne múltiplos hífens consecutivos
      .trim();
  }

  /**
   * Salva um arquivo no S3 com caminho organizado
   * @param fileBuffer Buffer do arquivo
   * @param filename Nome original do arquivo
   * @param path Caminho no S3 (ex: "1/files", "1/actions/2", "1/users/3")
   * @returns URL completa do arquivo salvo
   */
  async saveFile(fileBuffer: Buffer, filename: string, path?: string): Promise<string> {
    const ContentType = mime.getType(filename);

    if (!ContentType) {
      throw new Error('File type could not be determined');
    }

    // Extrair a extensão do arquivo
    const fileExtension = filename.split('.').pop() || '';
    
    // Codificar o nome do arquivo para evitar problemas com caracteres especiais
    const encodedFilename = this.encodeFilename(filename);
    
    // Generate a unique filename com o nome codificado
    const uniqueFilename = `${uuidv4()}-${encodedFilename}`;
    
    // Construir o caminho completo (Key)
    const fullPath = path ? `${path}/${uniqueFilename}` : uniqueFilename;

    const params = {
      Bucket: config.awsS3BucketName!,
      Key: fullPath,
      Body: fileBuffer,
      ContentType,
    };

    const command = new PutObjectCommand(params);
    try {
      await this.client.send(command);
      
      // Criar URL consistente que será usada tanto pela AWS quanto pelo MongoDB
      const s3Domain = `${config.awsS3BucketName}.s3.${config.awsRegion}.amazonaws.com`;
      const objectUrl = `https://${s3Domain}/${fullPath}`;
      
      return objectUrl;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  /**
   * Deleta um arquivo do S3 usando o caminho completo ou nome do arquivo
   * @param key Nome do arquivo ou caminho completo no S3
   */
  async deleteFile(key: string): Promise<void> {
    // Extrair apenas o nome do arquivo se for uma URL completa
    const fileKey = key.includes('amazonaws.com/') 
      ? key.split('amazonaws.com/')[1] 
      : key;

    const params = {
      Bucket: config.awsS3BucketName!,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(params);
    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }
  
  /**
   * Deleta todos os arquivos em uma pasta específica do S3
   * @param prefix O prefixo (caminho da pasta) a ser excluído
   * @returns Número de arquivos excluídos
   */
  async deleteFolder(prefix: string): Promise<number> {
    try {
      // Garantir que o prefixo termina com '/'
      const folderPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
      
      // Listar todos os objetos com este prefixo
      const listParams = {
        Bucket: config.awsS3BucketName!,
        Prefix: folderPrefix
      };
      
      const listCommand = new ListObjectsV2Command(listParams);
      const listedObjects = await this.client.send(listCommand);
      
      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`Nenhum arquivo encontrado em ${folderPrefix}`);
        return 0;
      }
      
      // Preparar os objetos para exclusão
      const deleteParams = {
        Bucket: config.awsS3BucketName!,
        Delete: {
          Objects: listedObjects.Contents.map(object => ({ Key: object.Key! })),
          Quiet: false
        }
      };
      
      // Excluir os objetos em lote
      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      const deletedObjects = await this.client.send(deleteCommand);
      
      console.log(`Excluídos ${deletedObjects.Deleted?.length || 0} arquivos de ${folderPrefix}`);
      return deletedObjects.Deleted?.length || 0;
    } catch (error) {
      console.error(`Erro ao excluir pasta ${prefix}:`, error);
      throw error;
    }
  }
  
  /**
   * Constrói o caminho para arquivos da ONG
   * @param ongId ID da ONG
   * @param type Tipo de arquivo ('files', 'actions', 'users')
   * @param subId ID da ação ou do usuário (opcional)
   * @returns Caminho formatado
   */
  buildPath(ongId: number | string, type: 'files' | 'actions' | 'users', subId?: number | string): string {
    const basePath = `${ongId}`;
    
    if ((type === 'actions' || type === 'users') && subId) {
      return `${basePath}/${type}/${subId}`;
    }
    
    return `${basePath}/${type}`;
  }
}

export default S3Storage;