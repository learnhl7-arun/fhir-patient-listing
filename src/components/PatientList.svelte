<script lang="ts">
    const fhirBaseUrl = import.meta.env.VITE_BASE_URL;
    import axios from "axios";
    import type { Patient } from "fhir/r4";
    import clsx from "clsx";
  
    let npage = 0;
  
    const fetchPatients = async (page: number) => {
      const patientResponse = await axios.get(`${fhirBaseUrl}/Patient`, {
        params: {
          name: "LXg0zshsD7-IGB2L56Qo8",
          _sort: "-_lastUpdated",
          _count: 14,
          _offset: npage * 14,
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
  
  <div class="max-w mx-auto">
    <h1 class="text-3xl font-bold">Patients on the Server</h1>
    <div class="table-container my-5" >
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
              <tr>
                <td>{patient?.resource?.id}</td>
                <td>{formatName(patient?.resource)}</td>
                <td>{patient?.resource?.birthDate || ""}</td>
                <td align="left">{patient?.resource?.gender || ""}</td>
                <td>View, Edit</td>
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
  
  <!-- <style>
    .table-container {
      /* max-height: 60vh;
      overflow-y: auto; */
      border: 1px solid black;
    }
  
    table {
      border-collapse: collapse;
      width: 100%;
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
  
    .button-container {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }
  
    .button-container button {
      min-width: 100px;
    }
  </style> -->

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