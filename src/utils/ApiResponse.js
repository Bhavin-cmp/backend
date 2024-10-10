class ApiResponse {
  constructor(statucCode, data, message = "Success") {
    this.statucCode = statucCode;
    this.data = data;
    this.message = message;
    this.success = statucCode < 400;
  }
}

export { ApiResponse };
