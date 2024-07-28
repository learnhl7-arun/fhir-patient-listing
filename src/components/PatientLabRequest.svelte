<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import { Modal, Button } from "flowbite-svelte";
  import { v4 as uuidv4 } from 'uuid'; //use short uuid
  import axios from "axios";
  import { patientStore } from "../stores/patientStore";
  import lab_services from '../assets/lab_services.json'
  import AddLabResultModal from './AddLabResultModal.svelte';

  const dispatch = createEventDispatcher();
  let patientId = ''
  let patientName = ""; // This should be fetched from the patientStore
  let modalVisible = false;
  let requestId = "";
  let orderingDoctor = "";
  let doctors = [];
  let orders = [];
  let labServices = [];
  let requestList = []
  const baseURL = import.meta.env.VITE_BASE_URL;

  let selectedLabServiceRequest = null;

  function openAddLabResultModal(serviceRequest) {
    selectedLabServiceRequest = serviceRequest;
  }

  function closeAddLabResultModal() {
    selectedLabServiceRequest = null;
  }


  onMount(async () => {
    patientStore.subscribe(value => {
      if (value) {
        patientName = value.name; // Get patient name from patientStore
        patientId = value.id
      }
    });
    fetchData()
    await fetchDoctors();
    await fetchLabServices();
  });
  const formatName = (resource) => {
      const firstNameElement = resource.name?.[0];
      const firstName = firstNameElement?.given?.join(" ");
      const lastName = firstNameElement?.family;
  
      if (lastName) {
        return `${firstName} ${lastName}`;
      }
      return `${firstName}`;
    };

    async function fetchData() {
    try {
      const response = await axios.get(`${baseURL}/ServiceRequest`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      requestList = response.data.entry;
      console.log(response.data.entry);
      console.log(response.data.entry[1].resource.code.coding[0].display)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchDoctors() {
 
// Subscribe to the baseUrlStore to get the current baseUrl

    try {
      const response = await axios.get(`${baseURL}/Practitioner`);
      doctors = response.data.entry.map(entry => ({
        id: entry.resource.id,
        // name: entry.resource.name?[0].text,
        name: formatName(entry.resource),
        role: entry.resource.qualification[0].code.coding[0].display
      }));
      console.log("doctors: ", doctors)
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  }

  async function fetchLabServices() {
    // Fetch lab services from lab_services.json
    try {
      const response = lab_services;
      labServices = response.labServices;
      console.log("labServices: ", labServices)
    } catch (error) {
      console.error("Error fetching lab services:", error);
    }
  }

  function openModal() {
    requestId = uuidv4();
    modalVisible = true;
  }

  function closeModal() {
    modalVisible = false;
  }


  function addNewOrder() {
    orders = [...orders, { orderId: uuidv4(), investigation: "", status: "active" }];
  }

  function deleteOrder(index) {
    orders = orders.filter((_, i) => i !== index);
  }

  async function saveLabRequest() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const bundle = {
      resourceType: "Bundle",
      type: "transaction",
      entry: orders.map(order => ({
        resource: {
          resourceType: "ServiceRequest",
          requisition: {
            system: "http://miniehr.com/lab-request",
            value: requestId
          },
          identifier: [{
            system: "http://miniehr.com/lab-order",
            value: order.orderId
          }],
          status: "active",
          intent: "original-order",
          category: [{
            coding: [{
              system: "http://hl7.org/fhir/ValueSet/servicerequest-category",
              code: "108252007",
              display: "Laboratory procedure"
            }]
          }],
          code: {
            coding: [{
              system: "http://loinc.org",
              code: order.investigation,
              display: labServices.find(service => service.serviceName === order.investigation)?.serviceName || order.investigation
            }]
          },
          subject: { reference: `Patient/${patientId}` },
          requester: { reference: `Practitioner/${orderingDoctor}` }
        },
        request: { method: "POST" }
      }))
    };
    try {
      await axios.post(`${baseURL}/`, bundle);
      console.log("post done!!")     
      dispatch("notify", { message: "Lab request saved successfully", type: "success" });
      closeModal();
      location.reload()
    } catch (error) {
      console.error("Error saving lab request:", error);
      dispatch("notify", { message: "Error saving lab request", type: "error" });
    }
  }
  
</script>

<aside class="bg-main-bg w-full h-full p-6 text-gray-700 rounded-l-xl">
  <div class="flex justify-between items-center">
    <h1 class="text-xl font-bold">Service Request Listing</h1>
    <button on:click={openModal} class="bg-accent-red text-white py-2 px-4 rounded-lg">New Lab Request</button>
  </div>

  <table class="min-w-full mt-6 bg-white shadow-md rounded-lg">
    <thead>
      <tr class="bg-gray-200">
        <th class="py-2 px-4">ID</th>
        <th class="py-2 px-4">Request ID</th>
        <th class="py-2 px-4">Lab Test Name</th>
        <th class="py-2 px-4">Status</th>
        <th class="py-2 px-4">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each requestList as serviceRequest}
      <tr class="py-2 px-6">
        <td class="py-2 px-6 ">{serviceRequest.resource.id}</td>
        <td class="py-2 px-6">{serviceRequest.resource.requisition.value}</td>
        <td class="py-2 px-6">{serviceRequest.resource.code.coding[0].display}</td>
        <td class="py-2 px-6">active</td>
        <td class="py-2 px-6">
          <Button outline color='yellow' class="ml-2 rounded">View Order</Button>
          <Button outline color='blue' class="ml-2 rounded" on:click={() => openAddLabResultModal(serviceRequest)}>Add Result</Button>
        </td>
      </tr>
      {/each}
    </tbody>
  </table>
  {#if selectedLabServiceRequest}
  <AddLabResultModal serviceRequest={selectedLabServiceRequest} orderingDoctor={orderingDoctor}  on:close={closeAddLabResultModal} />
{/if}

  <Modal title={`Add lab request for ${patientName}`} bind:open={modalVisible} autoclose >
    <form class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Request ID:</label>
        <input type="text" readonly bind:value={requestId} class="mt-1 p-2 w-full border border-gray-300 rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Ordering Doctor:</label>
        <select bind:value={orderingDoctor} class="mt-1 p-2 w-full border border-gray-300 rounded">
          {#each doctors as doctor}
          <option value={doctor.id}>{doctor.name} - {doctor.role}</option>
          {/each}
        </select>
      </div>
      <div>
        <table class="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr class="bg-gray-200">
              <th class="py-2 px-4">Order ID</th>
              <th class="py-2 px-4">Investigation</th>
              <th class="py-2 px-4">Status</th>
              <th class="py-2 px-4">Delete</th>
            </tr>
          </thead>
          <tbody>
            {#each orders as order, index}
              <tr>
                <td class="py-2 px-4">{order.orderId}</td>
                <td class="py-2 px-4">
                  <select bind:value={order.investigation} class="w-full border border-gray-300 rounded">
                    {#each labServices as service}
                      <option value={service.serviceName}>{service.serviceName}</option>
                    {/each}
                  </select>
                </td>
                <td class="py-2 px-4">{order.status}</td>
                <td class="py-2 px-4">
                  <button on:click={() => deleteOrder(index)} class="text-red-500">Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        <button on:click={addNewOrder} class="mt-2 bg-green-500 text-white px-4 py-2 rounded">Add New Order</button>
      </div>
      <div class="flex justify-end space-x-4">
        <button type="button" on:click={saveLabRequest} class="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        <button type="button" on:click={closeModal} class="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  </Modal>
</aside>

<style>
  .button:hover {
    color: #ee4d38;
  }
</style>
