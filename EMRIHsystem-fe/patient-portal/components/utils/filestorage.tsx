import { storage } from '../utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

interface FileWithPreview {
  file: File;
  dataUrl: string;
}

const uploadFiles = async (noMR: string, appointmentid: number, filesWithPreviews: FileWithPreview[]) => {
  const storageRef = ref(storage, `emrih/${noMR}/documents/${appointmentid}`);
  console.log(storageRef)
  const uploadTasks = filesWithPreviews.map(({ file }) => {
    const fileRef = ref(storageRef, file.name);
    return uploadBytes(fileRef, file);
  });

  await Promise.all(uploadTasks);

  const downloadURLs = await Promise.all(
    filesWithPreviews.map(async ({ file }) => {
      const fileRef = ref(storageRef, file.name);
      const fileUrl = await getDownloadURL(fileRef);
      return { filename: file.name, fileUrl };
    })
  );

  return downloadURLs;
};

const uploadFileKTP = async (nic: string, filesWithPreviews: FileWithPreview) => {
  const storageRef = ref(storage, `emrih/idc/${nic}`);
  const fileRef = ref(storageRef, 'ktp');
  await uploadBytes(fileRef, filesWithPreviews.file);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

export { uploadFiles, uploadFileKTP };
