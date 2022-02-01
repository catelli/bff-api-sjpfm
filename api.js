export default async function api(url, options) {
  if (options) {
    if (options.headers) {
      headers = options.headers;
    }
  }

  Object.assign();

  const response = await fetch(url, {
    ...options,
  });

  //sessionInterceptor(response);

  return response;
}
