import { writable } from "svelte/store";
import axios from "axios";

export const doctorsStore = writable([]);
export const doctorsStoreRaw = writable([]);
const baseURL = import.meta.env.VITE_BASE_URL;

export async function fetchDoctors() {
  try {
    const response = await axios.get(`${baseURL}/Practitioner`);
    const doctors = response.data.entry.map((entry) => ({
      id: entry.resource.id,
      name: formatName(entry.resource),
      role:
        entry.resource.qualification[0]?.code.coding[0]?.display || "Unknown",
    }));
    doctorsStore.set(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
  }
}

function formatName(resource) {
  if (resource.name && resource.name.length > 0) {
    return (
      resource.name[0].text ||
      `${resource.name[0].given.join(" ")} ${resource.name[0].family}`
    );
  }
  return "Unknown Name";
}

export async function fetchDoctorsRaw() {
  try {
    const response = await axios.get(`${baseURL}/Practitioner`);
    const doctors = response.data.entry.map((entry) => {
      const resource = entry.resource;
      return {
        id: resource.id,
        firstName:
          resource.name && resource.name[0] && resource.name[0].given
            ? resource.name[0].given.join(" ")
            : "",
        lastName:
          resource.name && resource.name[0] ? resource.name[0].family : "",
        qualificationCode:
          resource.qualification && resource.qualification[0]
            ? resource.qualification[0].code.coding[0].code
            : "",
        qualificationDisplay:
          resource.qualification && resource.qualification[0]
            ? resource.qualification[0].code.coding[0].display
            : "Unknown",
      };
    });
    doctorsStoreRaw.set(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
  }
}
