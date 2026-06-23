<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
header("Content-Type: text/html; charset=UTF-8");

// SPA 只有一個入口,永遠吐 index.html
readfile(__DIR__ . '/index.html');