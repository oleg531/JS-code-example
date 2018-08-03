export default class Http {
  constructor() {
    this.defaultContentType = "application/x-www-form-urlencoded";
  }
  get(url) {
    return this.commonRequest({
      method: "GET",
      url
    });
  }

  post(url, data) {
    return this.commonRequest({
      method: "POST",
      url,
      data
    });
  }

  commonRequest(options) {
    if (!options.method) {
      return Promise.reject(new Error("There is no method type specified for XHR"));
    }

    if (!options.url) {
      return Promise.reject(new Error("There is no url specified for XHR"));
    }

    const request = new XMLHttpRequest();
    request.open(options.method, options.url);
    request.setRequestHeader("Content-Type", this.defaultContentType);

    const promisResult = new Promise((resolve, reject) => {
      request.onload = () => {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          let responseErrorText = 'no info';
          try {
            responseErrorText = JSON.parse(request.response).message;
          }
          catch (e) {
            console.error(e);
          }
          reject(new Error(`${request.statusText} : ${responseErrorText}`));
        }
      };

      request.onerror = () => {
        reject(new Error("An error occurred during XHR"));
      };

      request.send(options.data);
    });

    return promisResult;
  }
}
