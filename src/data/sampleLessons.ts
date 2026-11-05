import { Lesson } from '../types';

export const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'lesson-polyglot-secrets',
    title: 'The Secrets of Learning a New Language',
    description: 'Listen to polyglot Lýdia Machová explain how ordinary people can achieve fluency in multiple languages by discovering enjoyable methods.',
    level: 'Intermediate',
    topic: 'Language & Psychology',
    mediaType: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=0x2_kWRB8-A',
    duration: 210, // ~3.5 min listening focus segment
    teacherId: 'teacher-master',
    teacherName: 'Prof. Eleanor Vance',
    createdAt: new Date().toISOString(),
    isHomeworkAvailable: true,
    captions: [
      { id: 'c1', start: 0, end: 5.5, text: "I love learning foreign languages. In fact, I love it so much that I like to learn a new language every two years." },
      { id: 'c2', start: 6, end: 11.2, text: "I'm currently on my eighth one. When people find this out about me, they always ask me, 'How do you do that? What's your secret?'" },
      { id: 'c3', start: 12, end: 17.8, text: "To be honest, for a long time, my answer was: 'I don't know. I just simply love it.'" },
      { id: 'c4', start: 18.5, end: 24.5, text: "People are never happy with that answer. They want to know why they are spending years trying to learn even one language, never achieving fluency." },
      { id: 'c5', start: 25, end: 31.0, text: "And here I come, a polyglot learning one after another. They want to know the secret of polyglots." },
      { id: 'c6', start: 32, end: 38.5, text: "That made me wonder too. How do other polyglots actually do it? Do we have something special in common? A language gene?" },
      { id: 'c7', start: 39, end: 46.0, text: "To find out, I decided to meet other people like me. The best place to meet polyglots is an event where hundreds of language lovers gather." },
      { id: 'c8', start: 47, end: 53.5, text: "I asked dozens of polyglots about their methods. And do you know what? Everyone had a completely different approach!" },
      { id: 'c9', start: 54, end: 60.5, text: "Benny from Ireland told me that his method is to start speaking from day one. He makes hundreds of mistakes, but he perseveres." },
      { id: 'c10', start: 61, end: 68.0, text: "Lucas from Brazil learned Russian simply by chatting with native speakers on Skype and reading Harry Potter." },
      { id: 'c11', start: 69, end: 76.5, text: "Another polyglot, Shannon, started by listening to podcasts and mimicking sounds until she had an epiphany about pronunciation." },
      { id: 'c12', start: 77, end: 84.0, text: "All of a sudden, I realized the one crucial thing we all share: none of us is a genius, but we all found a way to enjoy the process!" },
      { id: 'c13', start: 85, end: 92.5, text: "Language learning is not an agonizing chore. It is an adventure full of personal milestones, curiosity, and immersion." },
      { id: 'c14', start: 93, end: 101.0, text: "If you apply four pillars: enjoyment, effective methods, a consistent system, and patience, you can master any tongue." }
    ],
    difficultWords: [
      {
        id: 'w1',
        word: 'polyglot',
        phonetic: '/ˈpɒl.i.ɡlɒt/',
        partOfSpeech: 'noun',
        definition: 'A person who knows and is able to use several languages fluently.',
        exampleSentence: 'As a polyglot who speaks six languages, she travels the world with confidence.',
        imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
        timestamp: 25
      },
      {
        id: 'w2',
        word: 'fluency',
        phonetic: '/ˈfluː.ən.si/',
        partOfSpeech: 'noun',
        definition: 'The ability to speak, write, or understand a language easily, smoothly, and expressively.',
        exampleSentence: 'Daily conversation practice is the fastest path toward achieving native-like fluency.',
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80',
        timestamp: 22
      },
      {
        id: 'w3',
        word: 'perseveres',
        phonetic: '/ˌpɜː.sɪˈvɪəz/',
        partOfSpeech: 'verb',
        definition: 'Continues in a course of action despite difficulty or lack of success.',
        exampleSentence: 'Even when grammar gets complex, the determined student perseveres and succeeds.',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80',
        timestamp: 58
      },
      {
        id: 'w4',
        word: 'epiphany',
        phonetic: '/ɪˈpɪf.ən.i/',
        partOfSpeech: 'noun',
        definition: 'A moment of sudden and profound revelation or understanding.',
        exampleSentence: 'While listening to the audio clip, he had an epiphany about how vowel shifts work.',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
        timestamp: 74
      },
      {
        id: 'w5',
        word: 'immersion',
        phonetic: '/ɪˈmɜː.ʃən/',
        partOfSpeech: 'noun',
        definition: 'The state of being deeply engaged or surrounding oneself completely in a target language environment.',
        exampleSentence: 'Total audio immersion by tuning into English radio boosted her listening scores dramatically.',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
        timestamp: 90
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        prompt: 'How often does the speaker prefer to start learning a new foreign language?',
        timestamp: 11,
        points: 10,
        explanation: 'In the opening sentences (0:00 - 0:06), she mentions: "I like to learn a new language every two years."',
        options: [
          'Every six months',
          'Every two years',
          'Whenever she visits a foreign country',
          'Every five years'
        ],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        type: 'fill_in_blanks',
        prompt: 'Listen carefully and complete the missing words from the speaker\'s observation about polyglots:',
        timestamp: 38,
        points: 15,
        explanation: 'She wonders if polyglots have a special "gene" and describes attending an event where "hundreds" of language lovers gather.',
        template: 'She wondered if polyglots shared a special language [blank_1], so she attended an event where [blank_2] of language lovers gather.',
        blanks: [
          { id: 'blank_1', correctWord: 'gene', hint: 'Biological unit of heredity (4 letters)' },
          { id: 'blank_2', correctWord: 'hundreds', hint: 'A large number (plural of 100)' }
        ],
        wordBank: ['gene', 'talent', 'hundreds', 'thousands', 'gift']
      },
      {
        id: 'q3',
        type: 'matching',
        prompt: 'Match each polyglot mentioned in the talk with their unique learning method:',
        timestamp: 75,
        points: 15,
        explanation: 'Benny speaks from day one; Lucas chats on Skype and reads Harry Potter; Shannon mimics podcasts.',
        pairs: [
          { id: 'p1', left: 'Benny from Ireland', right: 'Starts speaking from day one making lots of errors' },
          { id: 'p2', left: 'Lucas from Brazil', right: 'Chats on Skype & reads Harry Potter in Russian' },
          { id: 'p3', left: 'Shannon', right: 'Listens to podcasts and mimics native sounds' }
        ]
      },
      {
        id: 'q4',
        type: 'close_ended',
        prompt: 'What single word does the speaker identify as the common ingredient that every successful polyglot shares?',
        timestamp: 88,
        points: 10,
        explanation: 'She emphasizes that above all, they all found a way to "enjoy" (or experience "enjoyment" / "fun") in the learning process.',
        acceptableAnswers: ['enjoy', 'enjoyment', 'fun', 'joy'],
        caseSensitive: false
      },
      {
        id: 'q5',
        type: 'drag_and_drop',
        prompt: 'Drag and place the 4 pillars of language learning mentioned by the speaker into the correct order:',
        timestamp: 100,
        points: 20,
        instruction: 'Place each pillar into its numbered spot (1st to 4th):',
        slots: [
          { id: 'slot-1', label: '1st Pillar (Core Catalyst)' },
          { id: 'slot-2', label: '2nd Pillar (Techniques)' },
          { id: 'slot-3', label: '3rd Pillar (Routine)' },
          { id: 'slot-4', label: '4th Pillar (Time)' }
        ],
        items: [
          { id: 'item-1', text: 'Enjoyment (Having fun)', targetSlotId: 'slot-1' },
          { id: 'item-2', text: 'Effective Methods (Custom techniques)', targetSlotId: 'slot-2' },
          { id: 'item-3', text: 'System (Daily schedule & habit)', targetSlotId: 'slot-3' },
          { id: 'item-4', text: 'Patience (Giving yourself time)', targetSlotId: 'slot-4' }
        ]
      },
      {
        id: 'q6',
        type: 'open_ended',
        prompt: 'Based on what you heard, how would you turn an "agonizing grammar drill" into an enjoyable activity for yourself? Give a 2-3 sentence proposal.',
        timestamp: 108,
        points: 10,
        explanation: 'Great listening! Consider personal interests: using favorite Netflix shows, cooking recipes in English, or voice-chatting with friends.',
        sampleAnswer: 'Instead of memorizing lists, I can watch my favorite sitcom with English subtitles and write down funny expressions. I can also record voice memos to practice speaking without anxiety.',
        evaluationRubric: 'Mentions a specific enjoyable activity, connects it to language practice, and explains why it helps motivation.'
      }
    ]
  },
  {
    id: 'lesson-coffee-idioms',
    title: 'Ordering at a Coffee Shop & Conversational Idioms',
    description: 'Master natural listening for fast colloquial English, polite requests, barista terminology, and common idioms in everyday café dialogue.',
    level: 'Beginner',
    topic: 'Daily Life & Socializing',
    mediaType: 'youtube',
    mediaUrl: 'https://www.youtube.com/watch?v=k238XpMMn38',
    duration: 150,
    teacherId: 'teacher-master',
    teacherName: 'Prof. Eleanor Vance',
    createdAt: new Date().toISOString(),
    isHomeworkAvailable: true,
    captions: [
      { id: 'cc1', start: 0, end: 4.5, text: "Next in line, please! Good morning, what can I get started for you today?" },
      { id: 'cc2', start: 5, end: 10.0, text: "Hi there! Could I grab a medium caramel macchiato with oat milk, please?" },
      { id: 'cc3', start: 10.5, end: 15.0, text: "Sure thing. Would you like that hot or iced? And do you want whipped cream on top?" },
      { id: 'cc4', start: 15.5, end: 20.0, text: "Iced, please. And light on the ice if possible. Hold the whipped cream." },
      { id: 'cc5', start: 20.5, end: 26.0, text: "You got it. Also, since it's our anniversary week, your pastry is on the house!" },
      { id: 'cc6', start: 26.5, end: 32.0, text: "Oh, that's awesome, thank you! I'll take a blueberry scone then. Is that for here or to go?" },
      { id: 'cc7', start: 32.5, end: 38.0, text: "To go, please. I'm in a bit of a rush before morning commute." }
    ],
    difficultWords: [
      {
        id: 'dw1',
        word: 'on the house',
        phonetic: '/ɒn ðə haʊs/',
        partOfSpeech: 'idiom',
        definition: 'Provided free of charge by the establishment or restaurant.',
        exampleSentence: 'Because we had to wait 20 minutes for our table, the manager said dessert was on the house.',
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
        timestamp: 24
      },
      {
        id: 'dw2',
        word: 'hold the',
        phonetic: '/həʊld ðə/',
        partOfSpeech: 'phrasal_verb',
        definition: 'To omit, exclude, or leave something off a food or beverage order.',
        exampleSentence: 'I ordered the cheeseburger but told the waiter to hold the pickles.',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
        timestamp: 19
      },
      {
        id: 'dw3',
        word: 'to go',
        phonetic: '/tə ɡəʊ/',
        partOfSpeech: 'idiom',
        definition: 'Packaged for consumption away from the café/restaurant; takeout.',
        exampleSentence: 'Two large coffees to go, please, we have a train to catch!',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
        timestamp: 33
      }
    ],
    questions: [
      {
        id: 'cq1',
        type: 'multiple_choice',
        prompt: 'What type of milk did the customer request in their caramel macchiato?',
        timestamp: 10,
        points: 10,
        options: ['Whole milk', 'Almond milk', 'Oat milk', 'Soy milk'],
        correctAnswerIndex: 2,
        explanation: 'At 0:07 the customer says: "Could I grab a medium caramel macchiato with oat milk, please?"'
      },
      {
        id: 'cq2',
        type: 'close_ended',
        prompt: 'What idiom did the barista use to express that the pastry is completely free?',
        timestamp: 26,
        points: 10,
        acceptableAnswers: ['on the house', 'on the house!'],
        caseSensitive: false,
        explanation: 'The barista says: "your pastry is on the house!" which means free of charge.'
      },
      {
        id: 'cq3',
        type: 'matching',
        prompt: 'Match the café phrase to its actual meaning:',
        timestamp: 35,
        points: 15,
        pairs: [
          { id: 'cp1', left: 'Hold the whipped cream', right: 'Do not put whipped cream on the beverage' },
          { id: 'cp2', left: 'On the house', right: 'Free courtesy of the restaurant' },
          { id: 'cp3', left: 'To go', right: 'Takeout for takeaway consumption' }
        ]
      }
    ]
  }
];
