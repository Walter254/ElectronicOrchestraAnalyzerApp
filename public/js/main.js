document.addEventListener('DOMContentLoaded', function() {
  const startAnalysisBtn = document.getElementById('startAnalysisBtn');
  if (startAnalysisBtn) {
    startAnalysisBtn.addEventListener('click', function() {
      window.location.href = '/instruments';
    });
  } else {
    console.error("Start Analysis button not found.");
  }
});