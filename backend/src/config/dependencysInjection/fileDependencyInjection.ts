import { FileRepository, UploadOngFileService, UploadActionFileService, DeleteFileService, GetActionFilesByCategoryService, GetOngFilesByCategoryService, FileController } from "@modules/file";
import { getActionService } from "@config/dependencysInjection/actionDependencyInjection"


const fileRepository = new FileRepository();
const uploadOngFileService = new UploadOngFileService(fileRepository);
const uploadActionFileService = new UploadActionFileService(fileRepository);
const deleteFileService = new DeleteFileService(fileRepository);
const getActionFilesByCategoryService = new GetActionFilesByCategoryService(fileRepository);
const getOngFilesByCategoryService = new GetOngFilesByCategoryService(fileRepository);

const fileController = new FileController(
  uploadOngFileService,
  uploadActionFileService,
  deleteFileService,
  getActionFilesByCategoryService,
  getOngFilesByCategoryService,
  getActionService
);

export { uploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService, fileController };