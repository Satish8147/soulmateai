
import { Profile } from './types';

// Mock Profiles Data
export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    age: 29,
    gender: 'Male',
    religion: 'Hindu',
    caste: 'Brahmin',
    subCaste: 'Kanyakubja',
    motherTongue: 'Hindi',
    profession: 'Software Engineer',
    location: 'Bangalore, India',
    education: 'B.Tech in Computer Science',
    height: '5\' 10"',
    income: '25-30 LPA',
    maritalStatus: 'Never Married',
    bio: 'I am a tech enthusiast who loves traveling and photography. Looking for someone who values family and has a modern outlook on life.',
    hobbies: ['Photography', 'Coding', 'Hiking'],
    imageUrl: 'https://picsum.photos/seed/aarav/400/500',
    gallery: [
      'https://picsum.photos/seed/aarav/400/500',
      'https://picsum.photos/seed/aarav2/400/500',
      'https://picsum.photos/seed/aarav3/400/500'
    ],
    verified: true
  },
  {
    id: '2',
    name: 'Priya Patel',
    age: 27,
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Patel',
    subCaste: 'Leuva',
    motherTongue: 'Gujarati',
    profession: 'Dentist',
    location: 'Mumbai, India',
    education: 'BDS, MDS',
    height: '5\' 5"',
    income: '15-20 LPA',
    maritalStatus: 'Never Married',
    bio: 'Passionate about healthcare and social work. I enjoy classical music and cooking. Searching for a partner who is supportive and ambitious.',
    hobbies: ['Cooking', 'Music', 'Reading'],
    imageUrl: 'https://picsum.photos/seed/priya/400/500',
    gallery: [
      'https://picsum.photos/seed/priya/400/500',
      'https://picsum.photos/seed/priya2/400/500'
    ],
    verified: true
  },
  {
    id: '3',
    name: 'Rohan Verma',
    age: 31,
    gender: 'Male',
    religion: 'Hindu',
    motherTongue: 'Hindi',
    profession: 'Investment Banker',
    location: 'London, UK',
    education: 'MBA Finance',
    height: '6\' 0"',
    income: '£80,000+',
    maritalStatus: 'Divorced',
    bio: 'Finance professional based in London. I love exploring new cultures and cuisines. Looking for a genuine connection.',
    hobbies: ['Travel', 'Wine Tasting', 'Tennis'],
    imageUrl: 'https://picsum.photos/seed/rohan/400/500',
    gallery: ['https://picsum.photos/seed/rohan/400/500'],
    verified: true
  },
  {
    id: '4',
    name: 'Sarah Thomas',
    age: 26,
    gender: 'Female',
    religion: 'Christian',
    motherTongue: 'Malayalam',
    profession: 'Architect',
    location: 'Kochi, India',
    education: 'B.Arch',
    height: '5\' 4"',
    income: '10-12 LPA',
    maritalStatus: 'Never Married',
    bio: 'Creative soul with a love for sustainable design. I value simplicity and honesty.',
    hobbies: ['Painting', 'Yoga', 'Gardening'],
    imageUrl: 'https://picsum.photos/seed/sarah/400/500',
    verified: true
  },
  {
    id: '5',
    name: 'Zain Malik',
    age: 28,
    gender: 'Male',
    religion: 'Muslim',
    motherTongue: 'Urdu',
    profession: 'Marketing Manager',
    location: 'Dubai, UAE',
    education: 'MBA Marketing',
    height: '5\' 11"',
    income: 'AED 15,000/mo',
    maritalStatus: 'Never Married',
    bio: 'Ambitious and family-oriented. I enjoy sports and networking. Seeking a partner who is educated and kind-hearted.',
    hobbies: ['Cricket', 'Blogging', 'Driving'],
    imageUrl: 'https://picsum.photos/seed/zain/400/500',
    verified: false
  },
  {
    id: '6',
    name: 'Ishita Gupta',
    age: 25,
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Baniya',
    subCaste: 'Agarwal',
    motherTongue: 'Hindi',
    profession: 'Fashion Designer',
    location: 'Delhi, India',
    education: 'NIFT Graduate',
    height: '5\' 6"',
    income: '12-15 LPA',
    maritalStatus: 'Never Married',
    bio: 'Fashion enthusiast with a modern outlook. I love animals and volunteering.',
    hobbies: ['Fashion', 'Animal Welfare', 'Sketching'],
    imageUrl: 'https://picsum.photos/seed/ishita/400/500',
    gallery: [
      'https://picsum.photos/seed/ishita/400/500',
      'https://picsum.photos/seed/ishita2/400/500',
      'https://picsum.photos/seed/ishita3/400/500',
      'https://picsum.photos/seed/ishita4/400/500'
    ],
    verified: true
  },
  {
    id: '7',
    name: 'Arjun Reddy',
    age: 30,
    gender: 'Male',
    religion: 'Hindu',
    motherTongue: 'Telugu',
    profession: 'Surgeon',
    location: 'Hyderabad, India',
    education: 'MS General Surgery',
    height: '5\' 9"',
    income: '35-40 LPA',
    maritalStatus: 'Never Married',
    bio: 'Dedicated doctor looking for a companion who understands the medical lifestyle. I enjoy fitness and movies.',
    hobbies: ['Gym', 'Movies', 'Cooking'],
    imageUrl: 'https://picsum.photos/seed/arjun/400/500',
    verified: true
  },
  {
    id: '8',
    name: 'Meera Iyer',
    age: 29,
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Brahmin',
    subCaste: 'Iyer',
    motherTongue: 'Tamil',
    profession: 'Classical Dancer',
    location: 'Chennai, India',
    education: 'M.A. Arts',
    height: '5\' 3"',
    income: '8-10 LPA',
    maritalStatus: 'Never Married',
    bio: 'Deeply rooted in culture and arts. I perform professionally and teach dance. Looking for someone who appreciates art.',
    hobbies: ['Dance', 'Reading', 'Meditation'],
    imageUrl: 'https://picsum.photos/seed/meera/400/500',
    verified: true
  }
];

export const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other'];
export const MOTHER_TONGUES = ['Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi', 'Bengali'];
export const MARITAL_STATUS_OPTIONS = ['Never Married', 'Divorced', 'Widowed'];

export const EDUCATION_OPTIONS = [
  'High School',
  'Diploma',
  'Bachelors (B.Tech/B.E)',
  'Bachelors (B.Sc)',
  'Bachelors (B.Com)',
  'Bachelors (B.A)',
  'Bachelors (BBA/BBM)',
  'Bachelors (BCA)',
  'Bachelors (B.Arch)',
  'Bachelors (B.Pharma)',
  'Bachelors (B.Des)',
  'Bachelors (LLB)',
  'Masters (M.Tech/M.E)',
  'Masters (M.Sc)',
  'Masters (M.Com)',
  'Masters (M.A)',
  'Masters (MBA/PGDM)',
  'Masters (MCA)',
  'Masters (M.Arch)',
  'Masters (M.Pharma)',
  'Masters (M.Des)',
  'Masters (LLM)',
  'Doctorate (Ph.D)',
  'Doctorate (M.D/M.S)',
  'CA/CS/ICWA',
  'Other'
];

export const HOBBIES_OPTIONS = [
  'Cooking',
  'Travel',
  'Photography',
  'Music',
  'Reading',
  'Movies',
  'Fitness/Gym',
  'Yoga',
  'Dancing',
  'Singing',
  'Painting/Sketching',
  'Gaming',
  'Sports',
  'Hiking',
  'Gardening',
  'Writing',
  'Volunteering',
  'Pets',
  'Tech/Coding',
  'Fashion',
  'Foodie'
];

export const CASTES = [
  'Lingayat',
  'Devang',
  'Brahmin',
  'Patel',
  'Baniya',
  'Maratha',
  'Reddy',
  'Kamma',
  'Kapu',
  'Goud',
  'SC',
  'ST',
  'Other'
];

export const SUB_CASTE_MAPPING: Record<string, string[]> = {
  'Lingayat': [
    'Agasa',
    'Ambig',
    'Badigar',
    'Bajanthri',
    'Bhovi',
    'Hatagar',
    'Kuruhinashetty',
    'Hugar',
    'Kumbar',
    'Panchamasali',
    'Banajiga',
    'Ganiga',
    'Jangam',
    'Gowda',
    'Nolamba',
    'Sadar'
  ],
  'Devang': [
    'Devanga Chettiar',
    'Devanga Shetty',
    'Devanga Brahmin',
    'Kannada Devanga',
    'Telugu Devanga',
    'Hattagara'
  ],
  'Brahmin': [
    'Iyer',
    'Iyengar',
    'Saraswat',
    'Deshastha',
    'Konkanastha',
    'Kanyakubja',
    'Saryuparin',
    'Gaur',
    'Maithil',
    'Namboodiri',
    'Smartha',
    'Bhumihar',
    'Havyaka',
    'Shivalli'
  ],
  'Patel': [
    'Leuva',
    'Kadva',
    'Anjana',
    'Mati'
  ],
  'Baniya': [
    'Agarwal',
    'Gupta',
    'Maheshwari',
    'Khandelwal',
    'Oswal',
    'Porwal',
    'Barnwal',
    'Rastogi'
  ],
  'Maratha': [
    '96 Kuli',
    'Kunbi',
    'Deshmukh',
    'Patil'
  ],
  'Reddy': [
    'Motati',
    'Pokanati',
    'Pakanati',
    'Pedakanti',
    'Gudati',
    'Bhumanchi'
  ],
  'Kamma': [
    'Chowdary',
    'Naidu',
    'Gandikota'
  ],
  'Kapu': [
    'Naidu',
    'Balija',
    'Telaga',
    'Ontari',
    'Munnuru Kapu'
  ],
  'Goud': [
    'Ediga',
    'Goud',
    'Setti Balija',
    'Gouda'
  ],
  'SC': [
    'Adi Dravida',
    'Adi Karnataka',
    'Mala',
    'Madiga',
    'Mahar',
    'Chamar',
    'Valmiki',
    'Pasi',
    'Dhobi'
  ],
  'ST': [
    'Gond',
    'Bhil',
    'Santal',
    'Meena',
    'Oraon',
    'Munda'
  ]
};
