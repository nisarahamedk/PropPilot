import { useEffect, useRef, useCallback, useState } from 'react';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  viewportHeight: number;
}

interface UseMobileKeyboardOptions {
  onKeyboardShow?: (height: number) => void;
  onKeyboardHide?: () => void;
  adjustViewport?: boolean;
  threshold?: number;
}

export const useMobileKeyboard = (options: UseMobileKeyboardOptions = {}) => {
  const {
    onKeyboardShow,
    onKeyboardHide,
    adjustViewport = true,
    threshold = 150,
  } = options;

  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    viewportHeight: window.innerHeight,
  });

  const initialViewportHeight = useRef(window.innerHeight);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight.current - currentHeight;
        const isKeyboardVisible = heightDifference > threshold;

        const newState: KeyboardState = {
          isVisible: isKeyboardVisible,
          height: isKeyboardVisible ? heightDifference : 0,
          viewportHeight: currentHeight,
        };

        setKeyboardState(prevState => {
          // Only trigger callbacks if state actually changed
          if (prevState.isVisible !== newState.isVisible) {
            if (newState.isVisible) {
              onKeyboardShow?.(newState.height);
            } else {
              onKeyboardHide?.();
            }
          }
          return newState;
        });

        // Adjust viewport if enabled
        if (adjustViewport) {
          document.documentElement.style.setProperty(
            '--keyboard-height',
            `${newState.height}px`
          );
          document.documentElement.style.setProperty(
            '--viewport-height',
            `${currentHeight}px`
          );
        }
      }, 100); // Debounce resize events
    };

    // Initial setup
    initialViewportHeight.current = window.innerHeight;
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // iOS specific events
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onKeyboardShow, onKeyboardHide, adjustViewport, threshold]);

  return keyboardState;
};

// Hook for auto-scrolling input into view when keyboard appears
export const useKeyboardAwareScroll = (inputRef: React.RefObject<HTMLElement>) => {
  const keyboardState = useMobileKeyboard({
    onKeyboardShow: (height) => {
      setTimeout(() => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          const availableHeight = window.innerHeight - height;
          
          if (rect.bottom > availableHeight) {
            const scrollAmount = rect.bottom - availableHeight + 20; // 20px padding
            window.scrollBy({
              top: scrollAmount,
              behavior: 'smooth',
            });
          }
        }
      }, 300); // Wait for keyboard animation
    },
  });

  return keyboardState;
};

// Hook for managing input focus and keyboard behavior
export const useInputFocus = () => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const focus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      // Scroll into view on iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);
      }
    }
  }, []);

  const blur = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return {
    inputRef,
    isFocused,
    focus,
    blur,
    handleFocus,
    handleBlur,
  };
};

// Hook for preventing zoom on input focus (iOS Safari)
export const usePreventZoom = () => {
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    const preventDoubleTouch = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Add meta viewport tag to prevent zoom
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }

    document.addEventListener('touchend', preventDoubleTouch, false);
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);
    document.addEventListener('gestureend', preventDefault);

    return () => {
      document.removeEventListener('touchend', preventDoubleTouch);
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
      document.removeEventListener('gestureend', preventDefault);

      // Restore normal zoom behavior
      if (metaViewport) {
        metaViewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0'
        );
      }
    };
  }, []);
};

// Hook for smart keyboard suggestions and autocomplete
export const useSmartKeyboard = (
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>
) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const enableSmartFeatures = useCallback(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      
      // Enable autocomplete and suggestions
      input.setAttribute('autocomplete', 'on');
      input.setAttribute('autocorrect', 'on');
      input.setAttribute('autocapitalize', 'sentences');
      input.setAttribute('spellcheck', 'true');
      
      // For input elements, set appropriate input types
      if (input.tagName === 'INPUT') {
        const inputElement = input as HTMLInputElement;
        if (inputElement.type === 'text') {
          inputElement.setAttribute('inputmode', 'text');
        }
      }
    }
  }, [inputRef]);

  const disableSmartFeatures = useCallback(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'none');
      input.setAttribute('spellcheck', 'false');
    }
  }, [inputRef]);

  // Smart suggestions based on context
  const generateSuggestions = useCallback((value: string) => {
    const commonPhrases = [
      'I need help with',
      'Can you help me',
      'I would like to',
      'The project involves',
      'My client needs',
      'The timeline is',
      'The budget is',
    ];

    if (value.length > 2) {
      const filtered = commonPhrases.filter(phrase =>
        phrase.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    enableSmartFeatures();
  }, [enableSmartFeatures]);

  return {
    suggestions,
    showSuggestions,
    setSuggestions,
    setShowSuggestions,
    generateSuggestions,
    enableSmartFeatures,
    disableSmartFeatures,
  };
};

// Hook for handling keyboard shortcuts on mobile
export const useMobileKeyboardShortcuts = () => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set(prev).add(e.key));

      // Common mobile shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'Enter':
            // Cmd/Ctrl + Enter to send message
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('mobile-shortcut-send'));
            break;
          case 'k':
            // Cmd/Ctrl + K to focus search
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('mobile-shortcut-search'));
            break;
          case '/':
            // Cmd/Ctrl + / to show shortcuts
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('mobile-shortcut-help'));
            break;
        }
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('mobile-shortcut-escape'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return { pressedKeys };
};

// Voice input hook (foundation for future voice features)
interface VoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export const useVoiceInput = (options: VoiceInputOptions = {}) => {
  const {
    onResult,
    onError,
    continuous = false,
    language = 'en-US',
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript || interimTranscript;
          setTranscript(fullTranscript);
          
          if (finalTranscript) {
            onResult?.(finalTranscript);
          }
        };

        recognition.onerror = (event) => {
          setIsListening(false);
          onError?.(event.error);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [continuous, language, onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
  };
};

// Combined hook for mobile input optimization
export const useMobileInputOptimization = () => {
  const keyboardState = useMobileKeyboard();
  const { pressedKeys } = useMobileKeyboardShortcuts();
  const voiceInput = useVoiceInput();

  usePreventZoom();

  return {
    keyboard: keyboardState,
    shortcuts: { pressedKeys },
    voice: voiceInput,
  };
};