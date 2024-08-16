(function(window){
  window["env"] = window["window"] || {};
  window["env"]["environment"] = "${environment}";
  window["env"]["hash"] = "${COMMIT_SHA}";
  window["env"]["baseUrl"] = "${baseUrl}";
  window["env"]["layoutUrl"] = "${layoutUrl}";
  window["env"]["loginUrl"] = "${loginUrl}";
  window["env"]["logoutUrl"] = "${logoutUrl}";
})(this)

getEnvParam('auth')
getEnvParam('hash')
function getEnvParam(parameter){
  switch(parameter){
      case "auth":
      document.getElementById("linkAuth").href="${authInfo}";
      break;
      case "hash":
      document.getElementById("lblHash").innerHTML="${COMMIT_SHA}";
      break;
    default:
      return "nonexist"
  }
}
