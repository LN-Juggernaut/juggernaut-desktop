const extractMessagePreview = (content, contentType) => {
  if (contentType === 'text') {
    return content;
  }
  if (contentType === 'payment') {
    return 'Payment';
  }
  if (contentType === 'paymentrequest') {
    return 'Payment Request';
  }
  if (contentType === 'json') {
    return 'Data';
  }
  return 'Unknown Message';
};

export default extractMessagePreview;
