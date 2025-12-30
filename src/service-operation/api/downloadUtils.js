import { API_BASE_URL, BASE_PATH } from '../constants/chatConstants';

export async function handleDownload({ fileName, queryIntent }) {
  if (!queryIntent) {
    alert("queryIntent is missing. Cannot download file.");
    return;
  }
  console.log("Downloading:", fileName, queryIntent);
  try {
    const params = new URLSearchParams({ fileName, queryIntent });
    const response = await fetch(`${API_BASE_URL}${BASE_PATH}/download-file?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Excel download failed', err);
  }
}