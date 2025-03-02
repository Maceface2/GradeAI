import { doc, setDoc, getDoc, getDocs, collection, query, where } from "firebase/firestore"
import { database } from "./Firebase"


// USER Photos
export async function getPhotoInformation(photoId){
  const docRef = doc(database, "photos", photoId);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists()){
    return docSnap.data();
  }
  return undefined;
}

export async function uploadPhotoInformation(currentUser, photoId, photoName=''){
  const photoInformation = structuredClone(
    {
      creator: currentUser.uid, 
      location: photoId, 
      date: new Date(),
      name: photoName
    })
  await setDoc(doc(database, "photos", photoId), photoInformation);
  return photoInformation
}


export async function getAllUserPhotos(currentUser){
  const photosRef = collection(database, "photos");
  const q = query(photosRef, where("creator", "==", currentUser.uid));
  const querySnapshot = await getDocs(q);
  const searchResults = []
  querySnapshot.forEach((doc) => {
    searchResults.push(doc.data())
  })
  return searchResults

}