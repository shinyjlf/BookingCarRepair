
(function (window, document, undefined) {

  // code that should be taken care of right away

  window.onload = init;

  function init() {
    // the code to be called when the dom has loaded
    var modal750954 = document.getElementById("myModal750954");// Get the modal
    var btn750954 = document.getElementById("myBtn750954");// Get the button that opens the modal
    var close750954 = document.getElementsByClassName("close750954")[0];// Get the <span> element that closes the modal

    if (btn750954 && close750954 && modal750954) {
      btn750954.onclick = function () {// When the user clicks the button, open the modal
        modal750954.style.display = "block";
       // modal750954classList.add("active");
      }

      close750954.onclick = function () {// When the user clicks on <span> (x), close the modal
        modal750954.style.display = "none";
      }

      window.onclick = function (event) {// When the user clicks anywhere outside of the modal, close it
        if (event.target == modal750954) {
          modal750954.style.display = "none";
        }
      }
    }
  }

})(window, document, undefined);


