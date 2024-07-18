<script lang="ts">
  const fhirBaseUrl = import.meta.env.VITE_BASE_URL;
  import axios from "axios";
  import type { Patient } from "fhir/r4";
  import clsx from "clsx";
  import { Button, Modal } from "flowbite-svelte";
  import {
    SearchOutline,
    PlusOutline,
    EyeOutline,
  } from "flowbite-svelte-icons";
  import { fhirApi } from "../api";
  import { patientStore} from "../stores/patientStore";

  let npage = 0;

  let patients = "";

  const fetchPatients = async (page: number) => {
    const patientResponse = await axios.get(`${fhirBaseUrl}/Patient`, {
      params: {
        name: "LXg0zshsD7-IGB2L56Qo8",
        _sort: "-_lastUpdated",
        _count: 10,
        _offset: npage * 10,
      },
    });
    patients = patientResponse.data;
    return patients;
  };

  const formatName = (resource: Patient) => {
    const firstNameElement = resource.name?.[0];
    const firstName = firstNameElement?.given?.join(" ");
    const lastName = firstNameElement?.family;

    if (lastName) {
      return `${firstName} ${lastName}`;
    }
    return `${firstName}`;
  };

  // ----- ADD Patient Modal Logic Code START ----- //
  let modalVisible = false;

  function openModal() {
    // generateMRN();
    modalVisible = true;
  }

  function closeModal() {
    modalVisible = false;
  }
  export let id: string = "";

  const dateToday = new Date().toISOString().split("T")[0];

  let messageString: any | undefined = undefined;
  let loading = false;

  const handleSubmit = async (e: SubmitEvent) => {
    loading = true;
    e.preventDefault();
    console.log({ firstName, lastName, patientGender, birthDate, phoneNumber });

    let fhirResource: Patient = {
      resourceType: "Patient",
    };
    fhirResource.name = [
      {
        given: [firstName],
        family: lastName,
        use: "usual",
        text: "LXg0zshsD7-IGB2L56Qo8",
      },
    ];
    fhirResource.birthDate = birthDate;
    fhirResource.gender = patientGender;

    if (phoneNumber) {
      fhirResource.telecom = [
        {
          system: "phone",
          value: phoneNumber,
        },
      ];
    }
    try {
      const response = await fhirApi.post("/Patient", fhirResource);
      closeModal();
    } catch (error) {
      console.error("Error adding patient:", error);
    }
    loading = false;
  };

  let firstName: string;
  let lastName: string | undefined;
  let patientGender: "male" | "female" | "other" | "unknown" | undefined =
    undefined;
  let birthDate: string;
  let phoneNumber: string;

  // ----- ADD Patient Modal Logic Code END ----- //

  // ----- Navigate to Patient Banner + Vitals --- START //
  function goToPatientDetail(patient: { resource: Patient }) {
    console.log("Selected patient: ", patient);
    const patientData = {
      id: patient?.resource.id,
      name: formatName(patient?.resource),
      gender: patient?.resource.gender,
      birthDate: patient?.resource.birthDate,
    };
    console.log("patientData: ", patientData);
    patientStore.set(patientData); // Set the selected patient data
    window.location.href = `/patient/${patient?.resource.id}/vitals`; // Navigate to the patient detail page
  }
  // ----- Navigate to Patient Banner + Vitals --- END //

  // ----- Patient Search Logic START -----//
  let patientName = "";
  let patientPhone = "";
  async function fetchPatientDataByName() {
    try {
      const response = await axios.get(`${fhirBaseUrl}/Patient`, {
        params: { name: patientName },
        headers: {
          "Content-Type": "application/json",
        }
      });
      console.log("Search Name Result",response.data);
      patients = response.data.entry;
    } catch (error) {
      console.error("Error fetching patient data by name:", error);
    }
  }
  async function fetchPatientDataByPhone() {
    try {
      const response = await axios.get(`${fhirBaseUrl}/Patient`, {
        params: { phone: patientPhone },
        headers: {
          "Content-Type": "application/json",
        }
      });
      console.log("Search Phone Result",response.data);
    } catch (error) {
      console.error("Error fetching patient data by phone:", error);
    }
  }
  function handleSubmitByName() {
    fetchPatientDataByName();
  }
  function handleSubmitByPhone() {
    fetchPatientDataByPhone();
  }
  // ----- Patient Search Logic END -----//
</script>

<!-- Main User Interface -->
<div class="max-w mx-auto">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-3xl font-bold flex-shrink-0 mr-1">
      Patients on the Server
    </h1>
    <form class="flex items-center gap-4 flex-grow ml-7" on:submit|preventDefault={handleSubmitByName}>
      <input
        type="text"
        placeholder="Patient Name"
        class="mt-1 p-1 w-[15vw] h-[5vh] border border-gray-300 rounded"
        id="patient-name" bind:value={patientName}
      />
      <Button color="blue" class="!p-2" type="submit">
        <SearchOutline class="w-6 h-6" />
      </Button>
    </form>
    <form class="flex items-center gap-3 flex-grow ml-2" on:submit|preventDefault={handleSubmitByPhone}>
      <input
        type="text"
        placeholder="Patient Phone"
        class="mt-1 p-1 w-[15vw] h-[5vh] border border-gray-300 rounded"
        id="patient-phone" bind:value={patientPhone}
      />
      <Button color="blue" class="!p-2" type="submit">
        <SearchOutline class="w-6 h-6" />
      </Button>
    </form>
    <Button
      type="button"
      color="red"
      on:click={openModal}
      class="flex items-center ml-2"
    >
      <PlusOutline class="w-6 h-6" />
      <span class="ml-2">Add Patient</span>
    </Button>
  </div>

  <!-- Patient Add Modal Start -->
  <Modal title="Create New Patient" bind:open={modalVisible} autoclose={false}>
    <form class="space-y-10" on:submit={handleSubmit}>
      <div class="space-y-5">
        <div>
          <label for="first_name" class="font-semibold block">First Name</label>
          <input
            bind:value={firstName}
            id="first_name"
            class="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label for="last_name" class="font-semibold block">Last Name</label>
          <input bind:value={lastName} id="last_name" class="border p-2" />
        </div>
        <div>
          <label for="gender" class="font-semibold block">Gender</label>
          <select
            bind:value={patientGender}
            id="gender"
            class="border p-2"
            required
          >
            <option value={undefined} disabled>Please Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label for="dob" class="font-semibold block">Date of Birth</label>
          <input
            bind:value={birthDate}
            id="dob"
            class="border p-2"
            type="date"
            max={dateToday}
            required
          />
        </div>
        <div>
          <label for="phone" class="font-semibold block">Phone Number</label>
          <input
            bind:value={phoneNumber}
            id="first_name"
            class="border p-2"
            type="tel"
            required
          />
        </div>
      </div>

      <div>
        <button class="p-2 bg-orange-600 hover:bg-black rounded-md text-white">
          {#if loading}
            Loading ...
          {:else}
            Submit
          {/if}
        </button>
      </div>
    </form>
    {#if messageString}
      <pre>
      Status:
      {JSON.stringify(messageString)}
  </pre>
    {/if}
  </Modal>

  <!-- Patient Add Modal End -->
  <div class="table-container my-5">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>DOB</th>
          <th>Gender</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#await fetchPatients(npage)}
          <tr>
            <td colspan="5">Loading...</td>
          </tr>
        {:then patients}
          {#each patients.entry as patient}
            <tr on:click={() => goToPatientDetail(patient)}>
              <td>{patient?.resource?.id}</td>
              <td>{formatName(patient?.resource)}</td>
              <td>{patient?.resource?.birthDate || ""}</td>
              <td align="left">{patient?.resource?.gender || ""}</td>
              <td>
                <button class="text-black-500 hover:text-black-700 p-2">
                  <EyeOutline class="w-5 h-5" />
                </button>
              </td>
            </tr>
          {/each}
        {:catch error}
          <tr>
            <td colspan="5">Error: {error.message}</td>
          </tr>
        {/await}
      </tbody>
    </table>
  </div>
  <div class="button-container">
    <button
      class={clsx("p-2 text-white mr-2", {
        "bg-black": npage != 0,
        "bg-gray-300": npage == 0,
      })}
      on:click={() => npage--}
      disabled={npage == 0}>Previous</button
    >
    <button class="p-2 bg-black text-white" on:click={() => npage++}
      >Next</button
    >
  </div>
</div>

<style>
  .table-container {
    max-height: 70vh; /* Adjust the height as needed */
    overflow-y: auto;
  }
  thead th {
    position: sticky;
    top: 0;
    background-color: #e8e8fd; /* Match with your design's header background color */
    z-index: 1; /* Ensure it stays above table rows */
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 12px;
    text-align: left;
  }
  th {
    font-weight: 600;
    color: #4b5563; /* Header text color */
  }

  tbody tr:hover {
    background-color: #f8f8ff; /* Row hover effect */
  }
</style>
