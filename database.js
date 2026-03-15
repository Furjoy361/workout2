import { db } from "./firebase.js";

import {
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

export async function addSquats(uid, reps, name){

const userRef = doc(db,"users",uid);

const docSnap = await getDoc(userRef);

if(docSnap.exists()){

const data = docSnap.data();

await setDoc(userRef,{
name: name,
squats: (data.squats || 0) + reps
},{merge:true});

}
else{

await setDoc(userRef,{
name: name,
squats: reps,
pushups: 0,
plank: 0
});

}

console.log("Database write successful");

}
