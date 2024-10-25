(require 'url)

(defun my-post-request (url data)
    "Make a POST request to URL with DATA."
    (let ((url-request-method "POST")
	(url-request-extra-headers '(("Content-Type" . "application/json")))
	(url-request-data (json-encode data)))
    (url-retrieve url 
		(lambda (status)
		;; Check for errors
		(message "status: %s" status)

		(unless (plist-get status :error)
		    (switch-to-buffer (current-buffer))
		    (message "Response: %s" (buffer-string)))
		))))

;; Data to be sent in the POST request
(setq my-data 
    '(:language "es"
    :text "El sol brilla mucho hoy."
    :processors "tokenize,mwt,pos,lemma,depparse"))

;; Making the POST request
;; (message "%s" (my-post-request "http://0.0.0.0:5050/nlp" my-data))
(message "%s" (my-post-request "https://nlp.vivalence.com/nlp" my-data))
