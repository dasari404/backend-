const scamAlerts = [
  {
    id: 1,
    severity: 'danger',
    icon: 'fa-exclamation-triangle',
    text: '⚠️ Fake guide near <strong>Taj Mahal Gate 2</strong> claiming to be "official". Do NOT pay upfront.',
    time: '2 mins ago',
    location: 'Agra, UP',
  },
  {
    id: 2,
    severity: 'warning',
    icon: 'fa-taxi',
    text: '🛺 Overpriced auto-rickshaws in <strong>Jaipur Old City</strong>. Verified fare: ₹80–120 (not ₹500).',
    time: '15 mins ago',
    location: 'Jaipur, RJ',
  },
  {
    id: 3,
    severity: 'ok',
    icon: 'fa-check-circle',
    text: '✅ Verified taxi fare: <strong>Delhi Airport → City = ₹350–400</strong>. Use Terminal 3 prepaid counters.',
    time: '32 mins ago',
    location: 'Delhi',
  },
  {
    id: 4,
    severity: 'danger',
    icon: 'fa-store',
    text: '⚠️ Fake gem shops on <strong>MG Road, Jaipur</strong> selling uncertified stones as "certified".',
    time: '1 hr ago',
    location: 'Jaipur, RJ',
  },
  {
    id: 5,
    severity: 'warning',
    icon: 'fa-camera',
    text: '📸 "Free photo" scam at <strong>Varanasi Ghats</strong>. Demands ₹500–1000 after taking photo.',
    time: '2 hrs ago',
    location: 'Varanasi, UP',
  },
];

module.exports = scamAlerts;
