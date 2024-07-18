import { writable } from "svelte/store";

// Define the writable store for the list of patients
export const patients = writable([]);

function createPersistentStore(key, startValue) {
    const { subscribe, set, update } = writable(startValue, () => {
        const json = sessionStorage.getItem(key);
        if (json) {
            set(JSON.parse(json));
        }

        return () => { };
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