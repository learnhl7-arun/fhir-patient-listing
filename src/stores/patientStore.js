// import { writable } from "svelte/store";
// import axios from "axios";
// // Define the writable store for the list of patients
// export const patients = writable([]);

// function createPersistentStore(key, startValue) {
//   const { subscribe, set, update } = writable(startValue, () => {
//     const json = sessionStorage.getItem(key);
//     if (json) {
//       set(JSON.parse(json));
//     }

//     return () => {};
//   });

//   return {
//     subscribe,
//     set: (value) => {
//       sessionStorage.setItem(key, JSON.stringify(value));
//       set(value);
//     },
//     update,
//   };
// }

// export const patientStore = createPersistentStore("patient", {
//   id: "",
//   name: "",
//   birthDate: "",
//   gender: "",
// });

// const baseURL = import.meta.env.VITE_BASE_URL;

// const createPatientDataStore = () => {
//   const { subscribe, set, update } = writable({
//     patientsListData: [],
//     isLoading: false,
//     fetchError: null,
//   });
//   let response = "";
//   const loadPatients = async (pageNumber) => {
//     update((state) => ({ ...state, isLoading: true, fetchError: null }));
//     try {
//       response = await axios.get(`${baseURL}/Patient`, {
//         params: {
//           _sort: "-_lastUpdated",
//           _count: 14,
//           _offset: pageNumber * 14,
//         },
//       });
//       set({
//         patientsListData: response.data.entry,

//         isLoading: false,
//         fetchError: null,
//       });
//     } catch (error) {
//       set({
//         patientsListData: [],
//         isLoading: false,
//         fetchError: error.message,
//       });
//     }
//     console.log("patientsListData in store: ", response.data);
//   };

//   return {
//     subscribe,
//     loadPatients,
//   };
// };

// export const patientDataStore = createPatientDataStore();

import { writable } from "svelte/store";

// Define the writable store for the list of patients
export const patients = writable([]);

function createPersistentStore(key, startValue) {
  const { subscribe, set, update } = writable(startValue, () => {
    const json = sessionStorage.getItem(key);
    if (json) {
      set(JSON.parse(json));
    }

    return () => {};
  });

  return {
    subscribe,
    set: (value) => {
      sessionStorage.setItem(key, JSON.stringify(value));
      set(value);
    },
    update,
  };
}

export const patientStore = createPersistentStore("patient", {
  id: "",
  name: "",
  birthDate: "",
  gender: "",
});
