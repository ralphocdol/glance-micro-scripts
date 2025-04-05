console.log('Custom API Script Loader loaded...')
document.querySelectorAll('script[type="custom-api-scripts"]').forEach((s, i) => {
    const newFunctionName = `scriptLoad_${i}`;
    const customApiScript = document.createElement('script');
    customApiScript.setAttribute('custom-api', `custom-api-script-${i}`);
    customApiScript.textContent = s.textContent.replace(/\bconst\s+scriptLoad\b/, `const ${newFunctionName}`);
    document.head.appendChild(customApiScript);
    setTimeout(() => eval(newFunctionName)(), 0);
    s.remove();
});