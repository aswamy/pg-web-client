import { toast } from "bulma-toast";

function copyToClipboard(copyString, copyConfirmation) {
  const element = document.createElement('textarea');
  element.value = copyString;
  document.querySelector('body').appendChild(element);
  element.select();
  document.execCommand('copy');
  document.querySelector('body').removeChild(element);

  toast({
    message: copyConfirmation,
    type: 'is-link',
    duration: 3000,
    opacity: 0.9,
    position: 'bottom-right',
    closeOnClick: true,
  });
}

export { copyToClipboard };