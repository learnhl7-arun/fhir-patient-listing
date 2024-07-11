<script lang="ts">
  const fhirBaseUrl = "https://hapi.fhir.org/baseR4";
  import axios from "axios";
  import type { Patient } from "fhir/r4";
  import clsx from "clsx";

  let npage = 0;

  const fetchPatients = async (page: number) => {
    const patientResponse = await axios.get(`${fhirBaseUrl}/Patient`, {
      params: {
        name: "LXg0zshsD7-IGB2L56Qo8",
        _sort: "-_lastUpdated",
        _count: 20,
        _offset: npage * 20,
      },
    });
    const patients = patientResponse.data;
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
</script>

<div class="bg-base-layer h-screen w-screen relative">
  <div
    class="absolute left-red-rect-right top-red-rect-top w-sidebar h-red-rectangle bg-accent-red rounded-2xl ml-6 mt-5"
  ></div>
  <div
    class="absolute left-main-right top-main-top w-main-content h-main-screen bg-main-bg rounded-3xl shadow-lg flex overflow-hidden ml-14 mt-10"
  >
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table with Header</title>
    <style>
      table {
        border-collapse: collapse;
      }
      th,
      td {
        border: 1px solid black;
        padding: 6px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
    </style>
  </head>
  <div class="max-w mx-auto my-10">
    <h1 class="text-3xl font-bold">Patients on the Server</h1>
    <table border="1">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>DOB</th>
        <th>Gender</th>
        <th>Actions</th>
      </tr>
      {#await fetchPatients(npage)}
        <p>Loading...</p>
      {:then patients}
        {#each patients.entry as patient}
          <tr>
            <td>{patient?.resource?.id}</td>
            <td>{formatName(patient?.resource)}</td>
            <td>{patient?.resource?.birthDate || ""}</td>
            <td align="left">{patient?.resource?.gender || ""}</td>
            <td>View, Edit</td>
          </tr>
        {/each}
      {:catch error}
        <p>Error: {error.message}</p>
      {/await}
    </table>
    <div class="mt-4">
      <button class={clsx("p-2 bg-black text-white",{
        'bg-black': npage != 0,
        'bg-gray-300': npage == 0,
      })} on:click={()=>npage--}>Previous</button>
      <button class="p-2 bg-black text-white" on:click={()=>npage++}>Next</button>
    </div>
  </div>
  </div>
</div>
