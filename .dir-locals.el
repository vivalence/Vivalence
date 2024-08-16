(
(defvar bruno-tests
  '(("Games Translations Provision" . "/Users/finn/vivalence/code/vivalence/.testing/viva_modules/games/translations/provision.bru")
    ("Games Translations Status" . "/Users/finn/vivalence/code/vivalence/.testing/viva_modules/games/translations/status.bru"))
  "List of Bruno tests with their names and file paths.")

;; Variable to store the last run test
(defvar bruno-last-test nil
  "Stores the last run Bruno test.")

(defun bruno-run-test (test-path)
  "Run a Bruno test with the given TEST-PATH and display results in a buffer."
  (if (file-exists-p test-path)
      (let ((default-directory "/Users/finn/vivalence/code/vivalence/.testing")
            (buffer (get-buffer-create "*Bruno Test Result*")))
        (with-current-buffer buffer
          (erase-buffer)
          (if (zerop (call-process "npx" nil t t
                                   "@usebruno/cli"
                                   "run"
                                   test-path
                                   "--env"
                                   "Local"))
              (progn
                (goto-char (point-min))
                (display-buffer buffer)
                (message "Bruno test executed successfully."))
            (error "Error executing Bruno test. Check the *Bruno Test Result* buffer for details."))))
    (error "Test file does not exist: %s" test-path)))

(defun bruno-run ()
  "Run a Bruno test selected from the list of available tests."
  (interactive)
  (let* ((test-name (completing-read "Select Bruno test to run: " 
                                     (mapcar #'car bruno-tests)))
         (test-path (cdr (assoc test-name bruno-tests))))
    (setq bruno-last-test test-path)
    (bruno-run-test test-path)))

(defun bruno-run-last ()
  "Run the last executed Bruno test."
  (interactive)
  (if bruno-last-test
      (bruno-run-test bruno-last-test)
    (user-error "No previous Bruno test run. Please use 'bruno-run' first.")))
)
