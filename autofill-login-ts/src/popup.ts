document.addEventListener("DOMContentLoaded", () => {
  const fillButton = document.getElementById("fill") as HTMLButtonElement | null;
  if (!fillButton) return;

  fillButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillLoginForm
    });
  });
});

function fillLoginForm() {
  const TEST_LOGIN = "test_user";
  const TEST_PASSWORD = "test_password";

  const usernameFields = document.querySelectorAll<HTMLInputElement>(
    "input[type='text'], input[type='email'], input[name*='user'], input[name*='login'], input[name*='email']"
  );
  const passwordFields = document.querySelectorAll<HTMLInputElement>(
    "input[type='password'], input[name*='pass']"
  );

  if (usernameFields.length > 0) {
    usernameFields[0].value = TEST_LOGIN;
    usernameFields[0].dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (passwordFields.length > 0) {
    passwordFields[0].value = TEST_PASSWORD;
    passwordFields[0].dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (usernameFields.length && passwordFields.length) {
    console.log("✅ Wypełniono login i hasło testowymi danymi.");
  } else {
    alert("❌ Nie znaleziono pól loginu/hasła na tej stronie.");
  }
}
