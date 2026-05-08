export const retryUpload = async (
  fn,
  retries = 3
) => {

  try {

    return await fn();

  } catch (error) {

    if (retries <= 0) {
      throw error;
    }

    console.log(
      "Retrying upload..."
    );

    return retryUpload(
      fn,
      retries - 1
    );
  }
};