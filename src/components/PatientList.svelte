<script lang="ts">
  import { onMount } from "svelte";
  import axios from "axios";
  import type { Patient } from "fhir/r4";
  import { writable } from "svelte/store";
  import { Button, Modal } from "flowbite-svelte";
  import {
    SearchOutline,
    PlusOutline,
    EyeOutline,
    PenOutline,
  } from "flowbite-svelte-icons";
  import { patientStore } from "../stores/patientStore.js";
  const fhirBaseUrl = import.meta.env.VITE_BASE_URL;
  import clsx from "clsx";

  let patientList = [];

  const loadingStore = writable<boolean>(false);

  let npage = 0;
  let searchParams: { name?: string; phone?: string } = {};

  let patientName = "";
  let patientPhone = "";
  let modalVisible = false;
  let editMode = false;
  let viewMode = false;

  let mrn: string;
  let govIdNum: string;
  let govIdFull: any;
  let govIdType: any;
  let email: string;
  let patient_id: any;
  let firstName: string;
  let lastName: string | undefined;
  let patientGender: "male" | "female" | "other" | "unknown" | undefined =
    undefined;
  let birthDate: string;
  let phone: string;

  const identifierMap = {
    DL: "Driver's Licence Number",
    BCT: "Birth Certificate",
    CZ: "Citizenship Card",
    HC: "Health Card Number",
    NI: "National Unique Individual Identifier",
    SS: "Social Security Number",
  };

  const dateToday = new Date().toISOString().split("T")[0];
  let loading = false;

  const fetchPatients = async (
    page: number,
    params: { name?: string; phone?: string } = {},
  ) => {
    loadingStore.set(true);
    try {
      const response = await axios.get(`${fhirBaseUrl}/Patient`, {
        params: {
          ...params,
          _sort: "-_lastUpdated",
          _count: 10,
          _offset: page * 10,
        },
      });
      const patients = response.data.entry
        ? response.data.entry.map((entry: any) => entry.resource)
        : [];
      console.log("patients:", patients);
      patientList = patients;
      console.log("patient list in fetch: ", patientList);
      patientStore.set(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      patientStore.set([]); // Clear the store in case of an error
    } finally {
      loadingStore.set(false);
    }
  };

  const handleSubmitByName = () => {
    searchParams = { name: patientName };
    fetchPatients(npage, searchParams);
  };

  const handleSubmitByPhone = () => {
    searchParams = { phone: patientPhone };
    fetchPatients(npage, searchParams);
  };

  const openModal = (patient?: Patient, isEdit = false, isView = false) => {
    viewMode = isView;
    if (!isView) generateMRN();
    if (patient) {
      mrn =
        patient?.identifier?.find((id) => id?.type?.coding[0]?.code === "MR")
          ?.value || "";
      editMode = isEdit;
      patient_id = patient.id;
      firstName = patient.name?.[0]?.given?.[0] || "";
      lastName = patient.name?.[0]?.family || "";
      patientGender = patient.gender || undefined;
      birthDate = patient.birthDate || "";
      phone = patient.telecom?.find((t) => t.system === "phone")?.value || "";
      email = patient.telecom?.find((t) => t.system === "email")?.value || "";

      // Find the identifier where the code is not "MR"
      const govId = patient.identifier?.find(
        (id) => id?.type?.coding[0]?.code !== "MR",
      );

      // Extract govIdNum, govIdType, and govIdFull from the found identifier
      govIdNum = govId?.value || "";
      govIdType = govId?.type?.coding[0]?.code || "";
      govIdFull = govId?.type?.coding[0]?.display || "";

      // Combine the govIdType code with its full name for the dropdown selection
      govIdType = `${govIdFull} (${govIdType})`;

      console.log("patient: ", patient);
      console.log("mrn: ", mrn);
      console.log("firstName: ", firstName);
      console.log("lastName; ", lastName);
      console.log("govtind: ", govIdNum);
      console.log("email: ", email);
      console.log("govIdType", govIdType);
      console.log("govIdFUll: ", govIdFull);
    } else {
      editMode = false;
      firstName = "";
      lastName = "";
      patientGender = undefined;
      birthDate = "";
      phone = "";
      email = "";
      govIdType = undefined;
      govIdNum = "";
      govIdFull = "";
    }
    modalVisible = true;
  };

  const closeModal = () => {
    modalVisible = false;
  };
  const handleSubmit = async (e: SubmitEvent) => {
    loading = true;
    e.preventDefault();
    const [fullName, code] = govIdType.split(" (");
    const formattedGovIdType = code.replace(")", "");
    govIdFull = identifierMap[formattedGovIdType];

    console.log("govIdType in submit: ", formattedGovIdType);
    let fhirResource: Patient = {
      resourceType: "Patient",
      identifier: [
        {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                code: "MR",
              },
            ],
          },
          value: mrn,
        },
        {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                code: formattedGovIdType,
                display: govIdFull,
              },
            ],
          },
          value: govIdNum,
        },
      ],
      name: [
        {
          given: [firstName],
          family: lastName,
          use: "usual",
        },
      ],
      birthDate: birthDate,
      gender: patientGender,
    };
    fhirResource.telecom = [];
    if (phone) {
      fhirResource?.telecom?.push({
        system: "phone",
        value: phone,
      });
    }

    // Add email object if email is available
    if (email) {
      fhirResource?.telecom?.push({
        system: "email",
        value: email,
      });
    }
    if (fhirResource.telecom.length === 0) {
      delete fhirResource.telecom;
    }
    try {
      await axios.post(`${fhirBaseUrl}/Patient`, fhirResource);
      closeModal();
      fetchPatients(npage, searchParams); // Refetch patients after adding a new one
    } catch (error) {
      console.error("Error adding patient:", error);
    } finally {
      loading = false;
    }
  };

  const formatName = (resource: Patient) => {
    const firstNameElement = resource.name?.[0];
    const firstName = firstNameElement?.given?.join(" ");
    const lastName = firstNameElement?.family;
    return lastName ? `${firstName} ${lastName}` : `${firstName}`;
  };

  const goToPatientDetail = (patient: Patient) => {
    console.log("Selected patient: ", patient);
    const patientData = {
      id: patient.id,
      name: formatName(patient),
      gender: patient.gender,
      birthDate: patient.birthDate,
    };
    console.log("patientData: ", patientData);
    patientStore.set(patientData);
    window.location.href = `/patient/${patient.id}/vitals`;
  };
  const handleUpdatePatient = async (event) => {
    event.preventDefault(); // Prevent form from submitting the traditional way
    loading = true;

    let fhirResource = {
      resourceType: "Patient",
      id: patient_id,
      name: [
        {
          given: [firstName],
          family: lastName,
          use: "usual",
          text: "LXg0zshsD7-IGB2L56Qo8",
        },
      ],
      birthDate: birthDate,
      gender: patientGender,
    };

    fhirResource.telecom = [];
    if (phone) {
      fhirResource?.telecom?.push({
        system: "phone",
        value: phone,
      });
    }

    // Add email object if email is available
    if (email) {
      fhirResource?.telecom?.push({
        system: "email",
        value: email,
      });
    }
    if (fhirResource.telecom.length === 0) {
      delete fhirResource.telecom;
    }

    try {
      const response = await fetch(`${fhirBaseUrl}/Patient/${patient_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fhirResource),
      });

      if (response.ok) {
        console.log("Patient updated!!");
        closeModal();
        // location.reload()
        fetchPatients(npage, searchParams);
      } else {
        const errorText = await response.text();
        console.error("Failed to update patient:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      loading = false;
    }
  };
  function handleGovIdTypeChange(event) {
    const selectedOption = event.target.value;
    const [fullName, code] = selectedOption.split(" (");
    govIdType = code.replace(")", "");
    console.log("govIdType in split:", govIdType);
    govIdFull = identifierMap[govIdType];
  }

  function generateMRN() {
    const now = new Date();
    const yymmddhhMMss = now.toISOString().slice(2, 19).replace(/[-T:]/g, "");
    mrn = `MRN${yymmddhhMMss}`;
  }

  const changePage = (newPage: number) => {
    if (newPage >= 0) {
      npage = newPage;
      fetchPatients(npage, searchParams);
    }
  };

  onMount(() => {
    fetchPatients(npage);
  });
</script>

<div class="max-w mx-auto">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-3xl font-bold flex-shrink-0 mr-1">
      Patients on the Server
    </h1>
    <form
      class="flex items-center gap-4 flex-grow ml-7"
      on:submit|preventDefault={handleSubmitByName}
    >
      <input
        type="text"
        placeholder="Patient Name"
        class="mt-1 p-1 w-[15vw] h-[5vh] border border-gray-300 rounded"
        id="patient-name"
        bind:value={patientName}
      />
      <Button color="blue" class="!p-2" type="submit">
        <SearchOutline class="w-6 h-6" />
      </Button>
    </form>
    <form
      class="flex items-center gap-3 flex-grow ml-2"
      on:submit|preventDefault={handleSubmitByPhone}
    >
      <input
        type="text"
        placeholder="Patient Phone"
        class="mt-1 p-1 w-[15vw] h-[5vh] border border-gray-300 rounded"
        id="patient-phone"
        bind:value={patientPhone}
      />
      <Button color="blue" class="!p-2" type="submit">
        <SearchOutline class="w-6 h-6" />
      </Button>
    </form>
    <Button
      type="button"
      color="red"
      on:click={() => openModal()}
      class="flex items-center ml-2"
    >
      <PlusOutline class="w-6 h-6" />
      <span class="ml-2">Add Patient</span>
    </Button>
  </div>

  <!-- <Modal title={editMode ? "Edit Patient" : "Create New Patient"} bind:open={modalVisible} autoclose={false}> -->
  <Modal
    title={editMode
      ? "Edit Patient"
      : viewMode
        ? "View Patient"
        : "Create New Patient"}
    bind:open={modalVisible}
    autoclose={false}
  >
    <form
      class="space-y-10"
      on:submit={editMode ? handleUpdatePatient : handleSubmit}
    >
      <div>
        <label for="mrn" class="font-semibold block">MRN</label>
        <input
          bind:value={mrn}
          id="mrn"
          class="mt-1 p-2 w-full border border-gray-300 rounded"
          required
          type="text"
          readonly={viewMode}
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="first_name" class="font-semibold block">First Name</label>
          <input
            bind:value={firstName}
            id="first_name"
            class="mt-1 p-2 w-full border border-gray-300 rounded"
            required
            readonly={viewMode}
          />
        </div>
        <div>
          <label for="last_name" class="font-semibold block">Last Name</label>
          <input
            bind:value={lastName}
            id="last_name"
            class="mt-1 p-2 w-full border border-gray-300 rounded"
            readonly={viewMode}
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="gender" class="font-semibold block">Gender</label>
          <select
            bind:value={patientGender}
            id="gender"
            class="mt-1 p-2 w-full border border-gray-300 rounded"
            required
            disabled={viewMode}
          >
            <option value={undefined} disabled>Please Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div>
          <label for="dob" class="font-semibold block">Date of Birth</label>
          <input
            bind:value={birthDate}
            id="dob"
            class="mt-1 p-2 w-full border border-gray-300 rounded"
            type="date"
            max={dateToday}
            required
            readonly={viewMode}
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Government Identifier Type:</label
          >
          <select
            on:input={(event) => handleGovIdTypeChange(event)}
            class="mt-1 p-2 w-full border border-gray-300 rounded"
            required
            disabled={viewMode}
            bind:value={govIdType}
          >
            <option value={undefined} disabled>Please Select</option>
            <option>Driver's licence number (DL)</option>
            <option>Birth Certificate (BCT)</option>
            <option>Citizenship Card (CZ)</option>
            <option>Health Card Number (HC)</option>
            <option>National unique individual identifier (NI)</option>
            <option>Social Security Number (SS)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Government Identifier Number:</label
          >
          <input
            type="text"
            bind:value={govIdNum}
            placeholder="Government Identifier Number"
            class="mt-1 p-2 w-full border border-gray-300 rounded"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="email" class="font-semibold block">Email</label>
          <input
            type="text"
            class="mt-1 p-2 w-full border border-gray-300 rounded"
            bind:value={email}
            required
            readonly={viewMode}
          />
        </div>
        <div>
          <label for="phone" class="font-semibold block">Phone Number</label>
          <input
            bind:value={phone}
            class="mt-1 border p-2 w-full border border-gray-300 rounded"
            type="text"
            required
            readonly={viewMode}
          />
        </div>
      </div>

      <div class="flex space-x-4">
        {#if !viewMode}
          <Button type="submit" color="red" class="flex items-center">
            <span class="ml-2"
              >{editMode ? "Save Changes" : "Create Patient"}</span
            >
          </Button>
        {/if}
      </div>
      <div>
        <Button
          type="button"
          on:click={() => closeModal()}
          class="flex items-center"
          color="alternative"
        >
          <span class="ml-2">Cancel</span>
        </Button>
      </div>
    </form>
  </Modal>

  {#if $loadingStore}
    <p>Loading...</p>
  {:else}
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">ID</th>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Gender</th>
            <th scope="col" class="px-6 py-3">Date of Birth</th>
            <th scope="col" class="px-6 py-3">Phone Number</th>
            <th scope="col" class="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each patientList as patient}
            <tr
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              on:click={() => goToPatientDetail(patient)}
            >
              <td class="px-6 py-4">{patient.id}</td>
              <td class="px-6 py-4">{formatName(patient)}</td>
              <td class="px-6 py-4">{patient.gender}</td>
              <td class="px-6 py-4">{patient.birthDate}</td>
              <td class="px-6 py-4"
                >{patient.telecom?.find((t) => t.system === "phone")?.value}</td
              >
              <td class="px-6 py-4 space-x-2" on:click|stopPropagation>
                <Button
                  type="button"
                  color="green"
                  size="xs"
                  on:click={() => openModal(patient, false, true)}
                >
                  <EyeOutline class="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  color="yellow"
                  size="xs"
                  on:click={() => openModal(patient, true)}
                >
                  <PenOutline class="w-4 h-4" />
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<div class="button-container m-5">
  <Button
    color="dark"
    on:click={() => changePage(npage - 1)}
    disabled={npage === 0}
  >
    Previous
  </Button>
  <Button color="dark" on:click={() => changePage(npage + 1)}>Next</Button>
</div>

<style>
  .table-container {
    max-height: 60vh; /* Adjust the height as needed */
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
