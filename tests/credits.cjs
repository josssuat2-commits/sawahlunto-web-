const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadPage } = require('./localization.cjs');
(async () => {
  for (const file of ['login_page.html', 'panduan_ui.html']) {
    assert.equal(loadPage(file).document.querySelector('.credits-trigger'), null);
  }
  for (const file of ['surat_page.html', 'surat_terbuka.html', 'kotak_terbuka_page.html']) {
    const page = loadPage(file);
    await page.flush();
    const trigger = page.document.querySelector('.credits-trigger');
    const dialog = page.document.querySelector('#creditsDialog');
    assert.equal(trigger.textContent, 'i');
    assert.equal(trigger.getAttribute('aria-label'), 'Kredit & Sumber Rujukan');
    assert.equal(trigger.hidden, false);
    const before = JSON.stringify([...page.stored]);
    const beforeSession = JSON.stringify([...page.session]);
    page.click(trigger); await page.flush();
    assert.equal(dialog.open, true);
    assert.equal(trigger.hidden, true);
    const data = page.window.SawahluntoCreditsData;
    const files = folder => fs.readdirSync(folder, {withFileTypes:true}).filter(f => f.isFile()).map(f => f.name).sort();
    assert.deepEqual([...data.images].sort(), files('imge'));
    assert.deepEqual([...data.music, ...data.sounds].sort(), files('sound'));
    assert.deepEqual(Array.from(data.content, g => g.items.length), [2,12,6,5,1]);
    for (const name of [...data.images, ...data.music, ...data.sounds]) assert.ok(dialog.textContent.includes(name));
    assert.match(dialog.textContent, /diperoleh dari internet/);
    assert.ok(!/CC BY|Terakreditasi|KITLV|ANRI/.test(dialog.textContent));
    page.setLanguage('en');
    assert.equal(page.text('#creditsTitle'), 'Credits & References');
    assert.equal(page.text('.credits-done'), 'Close Window');
    assert.ok(dialog.textContent.includes('surat-2.png'));
    page.setLanguage('id');
    page.click('.credits-done'); await page.flush();
    assert.equal(dialog.open, false);
    assert.equal(trigger.hidden, false);
    assert.equal(page.document.focusedElement, trigger);
    assert.equal(JSON.stringify([...page.stored]), before);
    assert.equal(JSON.stringify([...page.session]), beforeSession);
    for (const popup of page.document.querySelectorAll('dialog:not(#creditsDialog), .inspection-modal-overlay')) {
      if (popup.tagName === 'DIALOG') popup.showModal();
      else popup.classList.add('active');
      await page.flush();
      assert.equal(trigger.hidden, true, file + ': hidden while ' + popup.id + ' is open');
      page.click(trigger);
      assert.equal(dialog.open, false);
      if (popup.tagName === 'DIALOG') popup.close();
      else popup.classList.remove('active');
      await page.flush();
      assert.equal(trigger.hidden, false, file + ': restored after ' + popup.id);
    }
  }
  console.log('PASS: credit inventory covers all image/audio files and content; ID/EN, modal close/focus, popup hiding, and unchanged visitor/progress state.');
})().catch(error => { console.error(error); process.exitCode = 1; });
