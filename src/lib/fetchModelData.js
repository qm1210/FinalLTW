const BASE_URL = "https://q75ylp-8080.csb.app";

function fetchModel(url) {
  return fetch(BASE_URL + url, {
    credentials: "include", 
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .catch((error) => {
      console.error("fetchModel error:", error);
      throw error;
    });
}

export default fetchModel;
