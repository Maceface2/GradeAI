import { storage } from "./Firebase"

import { ref, uploadBytes, getDownloadURL, list } from "firebase/storage";

export async function savePhoto(photoId, photoFile) {
  const fileRef = ref(storage, `photos/${photoId}.png`);
  await uploadBytes(fileRef, photoFile);
}

export async function getPhotoUrl(photoId) {
  const fileRef = ref(storage, `photos/${photoId}.png`);
  try {
      const url = await getDownloadURL(fileRef);
      return url;
  } catch (error) {
      console.error("Error getting document:", error);
      return null;
  }
}