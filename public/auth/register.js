document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');
  const successEl = document.getElementById('success');
  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      successEl.textContent = 'Registration successful. You can now log in.';
      successEl.classList.remove('hidden');
      e.target.reset();
    } else {
      errorEl.textContent = data.error || 'Registration failed';
      errorEl.classList.remove('hidden');
    }
  } catch (err) {
    errorEl.textContent = 'Network error';
    errorEl.classList.remove('hidden');
  }
});
