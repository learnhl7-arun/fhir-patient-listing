<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import labServiceData from '../assets/lab_services.json';
  import { doctorsStore, fetchDoctors } from '../stores/doctorStore';

  export let serviceRequest;
  let orderingDoctor = '';
  let resultParams = [];
  const dispatch = createEventDispatcher();

  doctorsStore.subscribe(doctors => {
    const doctorId = serviceRequest.resource.requester.reference.split('/')[1];
    console.log("docid: ", doctorId)
    const doctor = doctors.find(doc => doc.id === doctorId);
    if (doctor) {
      orderingDoctor = doctor.name;
      console.log("orderingdoc:" ,doctor)
    }
  });

  onMount(async () => {
    await fetchDoctors();
    if (serviceRequest && serviceRequest.resource && serviceRequest.resource.code && serviceRequest.resource.code.coding.length > 0) {
      const serviceName = serviceRequest.resource.code.coding[0].display;
      const labService = labServiceData.labServices.find(service => service.serviceName === serviceName);

      if (labService) {
        resultParams = labService.resultParams;
      }
    }
  });

  function closeModal() {
    dispatch('close');
  }

  async function saveResults() {
    // Placeholder for API call
    const payload = {
      requestId: serviceRequest.resource.id,
      orderId: serviceRequest.resource.order,
      results: resultParams.map(param => ({
        resultCode: param.resultCode,
        resultValue: param.resultValue,
        uofm: param.uofm
      }))
    };

    try {
      const response = await fetch('/api/saveResults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log('API Response:', data);
      closeModal();
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }
</script>

<div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
  <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Add Lab Result for Patient {serviceRequest.resource.subject.display}</h2>
      <button class="text-gray-500 hover:text-gray-700" on:click={closeModal}>×</button>
    </div>
    <div>
      <p><strong>Request ID:</strong> {serviceRequest.resource.id}</p>
      <p><strong>Order ID:</strong> {serviceRequest.resource.order}</p>
      <p><strong>Investigation:</strong> {serviceRequest.resource.code.coding[0].display}</p>
      <p><strong>Ordering Doctor:</strong> {orderingDoctor}</p>
    </div>
    <div class="mt-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="font-semibold">Result Parameter</div>
        <div class="font-semibold">Result Parameter Value</div>
        <div class="font-semibold">UofM</div>
      </div>
      {#each resultParams as param}
        <div class="grid grid-cols-3 gap-4 items-center mb-2">
          <div>{param.resultName}</div>
          <input type="text" class="border rounded px-2 py-1" bind:value={param.resultValue} placeholder={`Enter ${param.resultName}`} />
          <div>{param.uofm}</div>
        </div>
      {/each}
    </div>
    <div class="flex justify-end mt-6">
      <button class="bg-yellow-500 text-white px-4 py-2 rounded mr-2" on:click={saveResults}>Save</button>
      <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded" on:click={closeModal}>Cancel</button>
    </div>
  </div>
</div>

<style>
  /* Additional styles if needed */
</style>
