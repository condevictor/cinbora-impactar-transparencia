import { FileRepository, UploadOngFileService, UploadActionFileService, DeleteFileService, GetActionFilesByCategoryService, GetOngFilesByCategoryService } from "@modules/file";

const fileRepository = new FileRepository();
const uploadOngFileService = new UploadOngFileService(fileRepository);
const uploadActionFileService = new UploadActionFileService(fileRepository);
const deleteFileService = new DeleteFileService(fileRepository);
const getActionFilesByCategoryService = new GetActionFilesByCategoryService(fileRepository);
const getOngFilesByCategoryService = new GetOngFilesByCategoryService(fileRepository);

export { uploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService };