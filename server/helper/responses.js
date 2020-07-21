const _responses = {
  success: (status_code, message, data) => {
    const success_message = {
      error: false,
      status_code: status_code,
      message: message,
      data
    };
    return success_message;
  },

  error: (status_code, message) => {
    const error_message = {
      error: true,
      status_code: status_code,
      message: message
    };
    return error_message;
  },

  output: (status_code, message, data, meta) => {
    const output_message = {
      error: false,
      status_code: status_code,
      message: message,
      data,
      meta
    };
    return output_message;
  }
};

module.exports = _responses;
