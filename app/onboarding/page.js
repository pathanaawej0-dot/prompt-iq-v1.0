'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const professionOptions = [
  { value: 'freelancer', label: 'Freelancer', description: 'Working with multiple clients or gigs' },
  { value: 'content_creator', label: 'Content Creator', description: 'Building an audience with content' },
  { value: 'business_owner', label: 'Business Owner', description: 'Running a product or service business' },
  { value: 'developer', label: 'Developer', description: 'Shipping software, apps, or automations' },
  { value: 'student', label: 'Student', description: 'Learning and experimenting with AI' },
  { value: 'other', label: 'Other', description: 'Something different? Tell us more.' },
];

// Adaptive goal options based on profession selection
const getGoalOptions = (professions) => {
  const baseGoals = {
    developer: [
      { value: 'build_better_products', label: 'Build better products', description: 'Improve product ideas, UX, and launches' },
      { value: 'learn_new_skills', label: 'Learn new skills', description: 'Master new frameworks and technologies' },
      { value: 'automate_workflows', label: 'Automate workflows', description: 'Streamline development and deployment processes' },
      { value: 'debug_faster', label: 'Debug faster', description: 'Get better at troubleshooting and problem-solving' },
    ],
    freelancer: [
      { value: 'get_more_clients', label: 'Get more clients', description: 'Land more projects and opportunities' },
      { value: 'improve_proposals', label: 'Improve proposals', description: 'Write winning project proposals and pitches' },
      { value: 'scale_business', label: 'Scale business', description: 'Grow from solo freelancer to agency' },
      { value: 'better_communication', label: 'Better communication', description: 'Improve client relationships and feedback' },
    ],
    content_creator: [
      { value: 'create_better_content', label: 'Create better content', description: 'Publish engaging videos, posts, and newsletters' },
      { value: 'grow_audience', label: 'Grow audience', description: 'Increase followers and engagement' },
      { value: 'monetize_content', label: 'Monetize content', description: 'Turn content into revenue streams' },
      { value: 'content_strategy', label: 'Content strategy', description: 'Plan and organize content calendars' },
    ],
    business_owner: [
      { value: 'grow_my_business', label: 'Grow my business', description: 'Scale revenue with smarter workflows' },
      { value: 'improve_operations', label: 'Improve operations', description: 'Streamline processes and reduce costs' },
      { value: 'better_marketing', label: 'Better marketing', description: 'Reach more customers effectively' },
      { value: 'team_management', label: 'Team management', description: 'Lead and motivate your team better' },
    ],
    student: [
      { value: 'learn_new_skills', label: 'Learn new skills', description: 'Master subjects and get better grades' },
      { value: 'research_help', label: 'Research help', description: 'Get assistance with projects and papers' },
      { value: 'career_prep', label: 'Career prep', description: 'Prepare for internships and job interviews' },
      { value: 'study_efficiently', label: 'Study efficiently', description: 'Learn faster with better study techniques' },
    ],
  };

  // Get unique goals based on selected professions
  const selectedGoals = new Map();
  professions.forEach(profession => {
    if (baseGoals[profession]) {
      baseGoals[profession].forEach(goal => {
        selectedGoals.set(goal.value, goal);
      });
    }
  });

  // Add common goals if no specific profession selected or for 'other'
  if (professions.length === 0 || professions.includes('other')) {
    const commonGoals = [
      { value: 'get_more_clients', label: 'Get more clients', description: 'Land more projects and opportunities' },
      { value: 'create_better_content', label: 'Create better content', description: 'Publish engaging videos, posts, and newsletters' },
      { value: 'grow_my_business', label: 'Grow my business', description: 'Scale revenue with smarter workflows' },
      { value: 'learn_new_skills', label: 'Learn new skills', description: 'Level up fast with guided practice prompts' },
      { value: 'build_better_products', label: 'Build better products', description: 'Improve product ideas, UX, and launches' },
    ];
    commonGoals.forEach(goal => selectedGoals.set(goal.value, goal));
  }

  const goalArray = Array.from(selectedGoals.values());
  goalArray.push({ value: 'other', label: 'Other', description: 'Have another goal? Share it with us.' });
  return goalArray;
};

// Adaptive industry options based on profession and goal selections
const getIndustryOptions = (professions, goals) => {
  const baseIndustries = {
    developer: [
      { value: 'tech_saas', label: 'Tech / SaaS', description: 'Software, AI tools, and platforms' },
      { value: 'fintech', label: 'FinTech', description: 'Financial technology and banking' },
      { value: 'gaming', label: 'Gaming', description: 'Video games and interactive entertainment' },
      { value: 'ecommerce', label: 'E-commerce', description: 'Online retail and marketplaces' },
    ],
    content_creator: [
      { value: 'media_entertainment', label: 'Media & Entertainment', description: 'Video, podcasts, and digital content' },
      { value: 'education', label: 'Education', description: 'Online courses and educational content' },
      { value: 'lifestyle', label: 'Lifestyle', description: 'Fashion, travel, and personal development' },
      { value: 'marketing', label: 'Marketing', description: 'Ads, campaigns, and funnel optimization' },
    ],
    business_owner: [
      { value: 'business', label: 'Business', description: 'Operations, sales, and leadership' },
      { value: 'consulting', label: 'Consulting', description: 'Professional services and advisory' },
      { value: 'retail', label: 'Retail', description: 'Physical and online stores' },
      { value: 'healthcare', label: 'Healthcare', description: 'Medical services and wellness' },
    ],
    freelancer: [
      { value: 'design', label: 'Design', description: 'Branding, product, and creative design' },
      { value: 'writing', label: 'Writing', description: 'Copywriting, blogs, and storytelling' },
      { value: 'marketing', label: 'Marketing', description: 'Ads, campaigns, and funnel optimization' },
      { value: 'tech_saas', label: 'Tech / SaaS', description: 'Software, AI tools, and platforms' },
    ],
    student: [
      { value: 'education', label: 'Education', description: 'Academic studies and research' },
      { value: 'tech_saas', label: 'Tech / SaaS', description: 'Software, AI tools, and platforms' },
      { value: 'business', label: 'Business', description: 'Operations, sales, and leadership' },
      { value: 'design', label: 'Design', description: 'Branding, product, and creative design' },
    ],
  };

  // Get unique industries based on selected professions
  const selectedIndustries = new Map();
  professions.forEach(profession => {
    if (baseIndustries[profession]) {
      baseIndustries[profession].forEach(industry => {
        selectedIndustries.set(industry.value, industry);
      });
    }
  });

  // Add common industries if no specific profession selected or for 'other'
  if (professions.length === 0 || professions.includes('other')) {
    const commonIndustries = [
      { value: 'tech_saas', label: 'Tech / SaaS', description: 'Software, AI tools, and platforms' },
      { value: 'marketing', label: 'Marketing', description: 'Ads, campaigns, and funnel optimization' },
      { value: 'design', label: 'Design', description: 'Branding, product, and creative design' },
      { value: 'writing', label: 'Writing', description: 'Copywriting, blogs, and storytelling' },
      { value: 'business', label: 'Business', description: 'Operations, sales, and leadership' },
    ];
    commonIndustries.forEach(industry => selectedIndustries.set(industry.value, industry));
  }

  const industryArray = Array.from(selectedIndustries.values());
  industryArray.push({ value: 'other', label: 'Other', description: 'Not listed? Let us know.' });
  return industryArray;
};

const OptionCard = ({ option, selected, onSelect, multiSelect = false }) => (
  <Card
    hover
    className={`cursor-pointer transition-all ${
      selected
        ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
        : 'border-gray-200 hover:border-blue-300'
    }`}
    onClick={() => onSelect(option.value)}
  >
    <Card.Content className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900">{option.label}</span>
        {selected && <CheckCircle className="w-4 h-4 text-blue-500" />}
      </div>
      <p className="text-sm text-gray-600">{option.description}</p>
      {multiSelect && (
        <div className="text-xs text-blue-600 font-medium">
          {selected ? '✓ Selected' : 'Click to select'}
        </div>
      )}
    </Card.Content>
  </Card>
);

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, loading, completeOnboarding } = useAuth();

  const [professions, setProfessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [otherProfession, setOtherProfession] = useState('');
  const [otherGoal, setOtherGoal] = useState('');
  const [otherIndustry, setOtherIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatingLibrary, setGeneratingLibrary] = useState(false);

  // Handle multi-select for professions
  const handleProfessionSelect = (value) => {
    setProfessions(prev => {
      if (prev.includes(value)) {
        return prev.filter(p => p !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Handle multi-select for goals
  const handleGoalSelect = (value) => {
    setGoals(prev => {
      if (prev.includes(value)) {
        return prev.filter(g => g !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Handle multi-select for industries
  const handleIndustrySelect = (value) => {
    setIndustries(prev => {
      if (prev.includes(value)) {
        return prev.filter(i => i !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Get adaptive options based on selections
  const goalOptions = getGoalOptions(professions);
  const industryOptions = getIndustryOptions(professions, goals);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (userProfile?.onboardingCompleted) {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (professions.length === 0 || goals.length === 0 || industries.length === 0) {
      toast.error('Please select at least one option for each question.');
      return;
    }

    if (professions.includes('other') && !otherProfession.trim()) {
      toast.error('Please describe what you do.');
      return;
    }

    if (goals.includes('other') && !otherGoal.trim()) {
      toast.error('Please share your main goal.');
      return;
    }

    if (industries.includes('other') && !otherIndustry.trim()) {
      toast.error('Please describe your industry.');
      return;
    }

    setSubmitting(true);

    const answers = {
      professions,
      professionDetail: professions.includes('other') ? otherProfession.trim() : null,
      goals,
      goalDetail: goals.includes('other') ? otherGoal.trim() : null,
      industries,
      industryDetail: industries.includes('other') ? otherIndustry.trim() : null,
    };

    const result = await completeOnboarding(answers);

    if (!result.success) {
      setSubmitting(false);
      toast.error(result.error || 'We could not save your answers. Please try again.');
      return;
    }

    // Generate personalized library
    try {
      setGeneratingLibrary(true);
      toast.loading('Creating your personalized library... This takes 30-60 seconds', { id: 'library-generation' });
      
      const libraryResponse = await fetch('/api/library/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          profile: answers
        })
      });

      const libraryResult = await libraryResponse.json();

      setSubmitting(false);
      setGeneratingLibrary(false);
      toast.dismiss('library-generation');

      if (!libraryResponse.ok) {
        if (libraryResult.redirect) {
          toast.success('Welcome back! Your library is already ready.');
          router.replace(libraryResult.redirect);
        } else {
          toast.error(libraryResult.error || 'Failed to generate your library. Please try again.');
        }
        return;
      }

      toast.success(`🎉 Success! Generated ${libraryResult.count} personalized prompts for you!`);
      router.replace('/library');

    } catch (libraryError) {
      setSubmitting(false);
      setGeneratingLibrary(false);
      toast.dismiss('library-generation');
      console.error('Library generation error:', libraryError);
      toast.error('Your profile was saved, but we had trouble generating your library. Please try again from the dashboard.');
      router.replace('/dashboard');
    }
  };

  const renderOtherInput = (type) => {
    if (type === 'profession' && professions.includes('other')) {
      return (
        <Input
          value={otherProfession}
          onChange={(e) => setOtherProfession(e.target.value)}
          placeholder="Tell us about your work"
        />
      );
    }

    if (type === 'goal' && goals.includes('other')) {
      return (
        <Input
          value={otherGoal}
          onChange={(e) => setOtherGoal(e.target.value)}
          placeholder="Share your main goal"
        />
      );
    }

    if (type === 'industry' && industries.includes('other')) {
      return (
        <Input
          value={otherIndustry}
          onChange={(e) => setOtherIndustry(e.target.value)}
          placeholder="Describe your industry"
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Just a few quick questions to personalize Prompt IQ</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            {`Let's craft 20 personalized prompts just for ${userProfile?.displayName || 'you'}`}
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Select multiple options that describe you best. Your choices will unlock personalized questions and recommendations.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">What do you do?</h2>
                <p className="text-sm text-gray-600">Select all roles that apply to you - this unlocks personalized goals.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {professionOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  option={option}
                  selected={professions.includes(option.value)}
                  onSelect={handleProfessionSelect}
                  multiSelect={true}
                />
              ))}
            </div>
            <div className="mt-4">
              {renderOtherInput('profession')}
            </div>
          </section>

          {professions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">What are your goals?</h2>
                  <p className="text-sm text-gray-600">Based on your role{professions.length > 1 ? 's' : ''}, here are relevant goals you can select.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {goalOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    option={option}
                    selected={goals.includes(option.value)}
                    onSelect={handleGoalSelect}
                    multiSelect={true}
                  />
                ))}
              </div>
              <div className="mt-4">
                {renderOtherInput('goal')}
              </div>
            </section>
          )}

          {goals.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Which industries do you work in?</h2>
                  <p className="text-sm text-gray-600">Select industries that match your work - we'll customize tone and terminology.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {industryOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    option={option}
                    selected={industries.includes(option.value)}
                    onSelect={handleIndustrySelect}
                    multiSelect={true}
                  />
                ))}
              </div>
              <div className="mt-4">
                {renderOtherInput('industry')}
              </div>
            </section>
          )}

          {industries.length > 0 && (
            <div className="flex justify-end">
              {generatingLibrary ? (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Creating Your Library...</h3>
                  <p className="text-gray-600">
                    AI is generating 10 personalized prompts for you
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This takes about 30-60 seconds
                  </p>
                </div>
              ) : (
                <Button type="submit" size="lg" loading={submitting} disabled={submitting}>
                  <span className="flex items-center">
                    Create my personalized library
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </span>
                </Button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
