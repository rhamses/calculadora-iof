var ambAjax = function(){
  this.xhr = new window.XMLHttpRequest();

  if (!this.xhr) {
    alert("Não tem xhr esse navegador. Melhor você trocar");
  };
}

ambAjax.prototype.get = function(url, callback){
  var ajax = this.xhr;
  var callback = callback;
  
  ajax.open("GET", url);

  ajax.onprogress = function(callback){
    // loading...
  };
  
  ajax.onload = function(){
    if (this.status === 200) {
      var response = JSON.parse(this.response);
    } else {
      var response = {
        status: false,
        message: "Deu algo errado"
      }
    }
    callback(response);
  };

  ajax.send();
}