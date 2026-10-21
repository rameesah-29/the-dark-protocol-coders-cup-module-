import { CharacterId } from '../config/characterVoices';

export interface ChroniclesStoryScene {
  id: string;
  sceneNumber: number;
  character: CharacterId;
  sceneTitle: string;
  subTitle: string;
  dialogue: string;
  emotion: string;
  backgroundMood: string;
  location: string;
}

export const HOGWARTS_CHRONICLES_SCENES: ChroniclesStoryScene[] = [
  {
    id: 'scene-1',
    sceneNumber: 1,
    character: 'dumbledore',
    sceneTitle: 'The Awakening of the Chamber Wards',
    subTitle: 'The Headmaster speaks from the Astronomy Tower',
    dialogue:
      "Welcome, students and scholars of Hogwarts. What you see before you is no ordinary trial. Lord Voldemort bound his most dangerous secrets into mathematical locks and ciphered wards. It takes more than wandwork to break them; it requires sharp minds, courageous hearts, and unity across our four noble houses.",
    emotion: 'wise',
    backgroundMood: '#d4af37',
    location: 'Headmaster\'s Tower',
  },
  {
    id: 'scene-2',
    sceneNumber: 2,
    character: 'harry',
    sceneTitle: 'The Ancient Prison Beneath Hogwarts',
    subTitle: 'Harry Potter delivers the escape warning',
    dialogue:
      "Listen carefully. I don't have much time to explain. Beneath the grounds of Hogwarts lies an ancient prison. The spells protecting its chambers have been corrupted, and something that should never have escaped is now roaming the corridors. You have ninety minutes to solve the mathematical enchantments and unlock the chambers. **Don't let it catch you.** Your escape begins… NOW.",
    emotion: 'brave',
    backgroundMood: '#dc2626',
    location: 'The Corrupted Chambers',
  },
  {
    id: 'scene-3',
    sceneNumber: 3,
    character: 'hermione',
    sceneTitle: 'The Arithmancy Matrix Decryption',
    subTitle: 'Hermione Granger demonstrates the cipher technique',
    dialogue:
      "Now, pay attention! In Round 1, each squad is assigned a designated Folder containing three ciphers. You will encounter Caesar rotational dials, XOR matrices, and modular arithmetic residue formulas. Remember to compute the modular inverse correctly—and if you ask for a hint, be mindful of the ten-minute penalty!",
    emotion: 'intelligent',
    backgroundMood: '#b91c1c',
    location: 'Arithmancy Classroom',
  },
  {
    id: 'scene-4',
    sceneNumber: 4,
    character: 'ron',
    sceneTitle: 'A Warning from Gryffindor Tower',
    subTitle: 'Ron Weasley shares his tactical advice',
    dialogue:
      "Bloody hell, Hermione's not kidding! Last time I tried doing modular arithmetic without parchment, my wand started shooting sparks and my ears turned purple. Just keep your heads cool, double-check your numbers, and don't let the Slytherins beat us on the live leaderboard!",
    emotion: 'humorous',
    backgroundMood: '#ea580c',
    location: 'Gryffindor Common Room',
  },
  {
    id: 'scene-5',
    sceneNumber: 5,
    character: 'snape',
    sceneTitle: 'The Master\'s Injunction',
    subTitle: 'Professor Snape inspects the candidates',
    dialogue:
      "Fools rush in where masters deliberate. Do not think that random guessing will penetrate these enchanted matrices. Every mistake carries a cost. The countdown hourglass does not pause for your hesitation. Proceed... if you possess the intellect.",
    emotion: 'intimidating',
    backgroundMood: '#16a34a',
    location: 'Potions Dungeons',
  },
  {
    id: 'scene-6',
    sceneNumber: 6,
    character: 'hagrid',
    sceneTitle: 'Encouragement at the Edge of the Forest',
    subTitle: 'Hagrid cheers on the squads',
    dialogue:
      "Don't you listen to Snape's sour talk! You've got Hogwarts magic runnin' through your veins. Just take a deep breath, trust your team, and tackle them puzzles one step at a time. Old Hagrid's rootin' for every one of you!",
    emotion: 'warm',
    backgroundMood: '#ca8a04',
    location: 'Hagrid\'s Hut & Castle Grounds',
  },
  {
    id: 'scene-7',
    sceneNumber: 7,
    character: 'mcgonagall',
    sceneTitle: 'The House Cup Begins',
    subTitle: 'Professor McGonagall inaugurates the competition',
    dialogue:
      "The Great Hall hourglass is synchronized. The 15-minute sentinels are at their posts. Register your squad name, unseal your folder, and let the Hogwarts Cyber-Arithmancy module commence!",
    emotion: 'commanding',
    backgroundMood: '#059669',
    location: 'The Great Hall',
  },
];
