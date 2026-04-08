// Web Speech API type declarations
// (not fully included in TypeScript's DOM lib)

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart:   ((ev: Event) => unknown) | null;
  onend:     ((ev: Event) => unknown) | null;
  onresult:  ((ev: SpeechRecognitionEvent) => unknown) | null;
  onerror:   ((ev: SpeechRecognitionErrorEvent) => unknown) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare let SpeechRecognition: { prototype: SpeechRecognition; new(): SpeechRecognition };

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
