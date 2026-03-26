import { PrismaClient, ServiceCategory, BadgeType } from "@prisma/client";

const prisma = new PrismaClient();

interface ServiceInput {
  slug: string;
  name: string;
  category: ServiceCategory;
  websiteUrl: string;
  description?: string;
}

const NEW_SERVICES: ServiceInput[] = [
  // AGENTS
  { slug: "relevance-ai", name: "Relevance AI", category: "AGENTS", websiteUrl: "https://relevanceai.com", description: "No-code platform to build, deploy, and scale AI agents for business automation." },
  { slug: "bland-ai", name: "Bland AI", category: "AGENTS", websiteUrl: "https://www.bland.ai", description: "AI phone calling platform for automating outbound and inbound calls." },
  { slug: "vapi-ai", name: "Vapi", category: "AGENTS", websiteUrl: "https://vapi.ai", description: "Developer platform for building, testing, and deploying voice AI agents." },
  { slug: "fixie-ai", name: "Fixie", category: "AGENTS", websiteUrl: "https://www.fixie.ai", description: "Platform for building AI agents that can browse the web and take actions." },
  { slug: "openai-operator", name: "OpenAI Operator", category: "AGENTS", websiteUrl: "https://openai.com", description: "OpenAI's autonomous web browsing agent for completing real-world tasks." },
  { slug: "multion-ai", name: "MultiOn", category: "AGENTS", websiteUrl: "https://www.multion.ai", description: "AI agent that can browse the web and complete tasks autonomously." },
  { slug: "pydantic-ai", name: "Pydantic AI", category: "AGENTS", websiteUrl: "https://ai.pydantic.dev", description: "Python agent framework built by the Pydantic team for type-safe AI applications." },
  { slug: "glif", name: "Glif", category: "AGENTS", websiteUrl: "https://glif.app", description: "Visual AI workflow builder for creating and sharing automated creative pipelines." },
  { slug: "manus", name: "Manus", category: "AGENTS", websiteUrl: "https://manus.im", description: "General-purpose AI agent capable of handling complex multi-step tasks autonomously." },
  { slug: "browser-use", name: "Browser Use", category: "AGENTS", websiteUrl: "https://browser-use.com", description: "Open-source library enabling AI agents to control web browsers." },
  { slug: "relay", name: "Relay.app", category: "AGENTS", websiteUrl: "https://www.relay.app", description: "Human-in-the-loop workflow automation combining AI and team collaboration." },
  { slug: "composio", name: "Composio", category: "AGENTS", websiteUrl: "https://composio.dev", description: "Integration platform providing 150+ tools for AI agents and LLM applications." },
  { slug: "e2b", name: "E2B", category: "AGENTS", websiteUrl: "https://e2b.dev", description: "Secure cloud sandboxes for running AI-generated code safely." },
  { slug: "outset-ai", name: "Outset", category: "AGENTS", websiteUrl: "https://www.outset.ai", description: "AI-moderated research interviews that conduct and analyze user conversations at scale." },

  // AUDIO
  { slug: "podcastle", name: "Podcastle", category: "AUDIO", websiteUrl: "https://podcastle.ai", description: "AI-powered podcast creation platform with recording, editing, and transcription." },
  { slug: "wellsaid-labs", name: "WellSaid Labs", category: "AUDIO", websiteUrl: "https://wellsaidlabs.com", description: "Enterprise AI voice platform for creating studio-quality synthetic voiceovers." },
  { slug: "fireflies-ai", name: "Fireflies.ai", category: "AUDIO", websiteUrl: "https://fireflies.ai", description: "AI meeting assistant that records, transcribes, and analyzes voice conversations." },
  { slug: "notta-ai", name: "Notta", category: "AUDIO", websiteUrl: "https://www.notta.ai", description: "AI transcription and note-taking tool supporting 100+ languages in real time." },
  { slug: "lovo-ai", name: "LOVO AI", category: "AUDIO", websiteUrl: "https://lovo.ai", description: "AI voice generator and text-to-speech platform with 500+ voices." },
  { slug: "cartesia-ai", name: "Cartesia", category: "AUDIO", websiteUrl: "https://cartesia.ai", description: "Real-time voice AI infrastructure for fast, natural-sounding speech synthesis." },
  { slug: "clova-note", name: "ClovaNote", category: "AUDIO", websiteUrl: "https://clovanote.naver.com", description: "AI meeting recorder and transcription service by NAVER." },
  { slug: "dubverse", name: "Dubverse", category: "AUDIO", websiteUrl: "https://dubverse.ai", description: "AI-powered video dubbing platform supporting 30+ languages." },
  { slug: "blakify", name: "Blakify", category: "AUDIO", websiteUrl: "https://blakify.com", description: "AI text-to-speech tool for creating natural voiceovers for content creators." },
  { slug: "vocal-remover", name: "Vocal Remover", category: "AUDIO", websiteUrl: "https://vocalremover.org", description: "Free AI tool to separate vocals from music tracks instantly." },
  { slug: "lalal-ai", name: "LALAL.AI", category: "AUDIO", websiteUrl: "https://www.lalal.ai", description: "AI stem splitter for separating vocals, instruments, and other audio components." },

  // DESIGN
  { slug: "uizard", name: "Uizard", category: "DESIGN", websiteUrl: "https://uizard.io", description: "AI-powered UI design tool that turns sketches and text into app mockups." },
  { slug: "relume", name: "Relume", category: "DESIGN", websiteUrl: "https://www.relume.io", description: "AI website builder generating sitemaps and wireframes for Webflow and Figma." },
  { slug: "galileo-ai", name: "Galileo AI", category: "DESIGN", websiteUrl: "https://www.usegalileo.ai", description: "AI UI design tool that generates high-fidelity app designs from text descriptions." },
  { slug: "looka", name: "Looka", category: "DESIGN", websiteUrl: "https://looka.com", description: "AI logo maker and brand identity platform for businesses and entrepreneurs." },
  { slug: "designs-ai", name: "Designs.ai", category: "DESIGN", websiteUrl: "https://designs.ai", description: "AI creative suite for logos, videos, mockups, and marketing materials." },
  { slug: "kittel-ai", name: "Kittl", category: "DESIGN", websiteUrl: "https://www.kittl.com", description: "AI-enhanced graphic design platform for creating professional marketing visuals." },
  { slug: "brandmark-io", name: "Brandmark", category: "DESIGN", websiteUrl: "https://brandmark.io", description: "AI logo design tool that generates unique brand identities from keywords." },
  { slug: "mokker-ai", name: "Mokker", category: "DESIGN", websiteUrl: "https://mokker.ai", description: "AI product photography tool for generating professional backgrounds instantly." },
  { slug: "flair-ai", name: "Flair", category: "DESIGN", websiteUrl: "https://flair.ai", description: "AI design platform for generating branded product photography at scale." },
  { slug: "viesus", name: "Viesus", category: "DESIGN", websiteUrl: "https://www.viesus.com", description: "AI image enhancement platform for automatically improving photo quality." },
  { slug: "poly-design", name: "Poly", category: "DESIGN", websiteUrl: "https://withpoly.com", description: "AI texture and material generator for 3D designers and game developers." },
  { slug: "khroma-design", name: "Khroma", category: "DESIGN", websiteUrl: "https://www.khroma.co", description: "AI color palette tool that learns your preferences to generate perfect combinations." },
  { slug: "autodraw", name: "AutoDraw", category: "DESIGN", websiteUrl: "https://www.autodraw.com", description: "Google's AI drawing tool that suggests professional icons from rough sketches." },
  { slug: "illustroke", name: "Illustroke", category: "DESIGN", websiteUrl: "https://illustroke.com", description: "AI SVG illustration generator that creates vector images from text prompts." },
  { slug: "recast-studio", name: "Recast Studio", category: "DESIGN", websiteUrl: "https://recast.studio", description: "AI video repurposing tool for turning podcasts into short-form social content." },
  { slug: "logomaster-ai", name: "Logomaster", category: "DESIGN", websiteUrl: "https://logomaster.ai", description: "AI logo generator for creating professional brand identities in minutes." },
  { slug: "dora", name: "Dora", category: "DESIGN", websiteUrl: "https://www.dora.run/ai", description: "AI-powered 3D website builder for creating animated no-code web experiences." },
  { slug: "motiff", name: "Motiff", category: "DESIGN", websiteUrl: "https://www.motiff.com", description: "AI-powered UI design tool with Figma-like features and AI layout generation." },
  { slug: "creatie", name: "Creatie", category: "DESIGN", websiteUrl: "https://creatie.ai", description: "AI design tool that generates UI components, icons, and layouts from prompts." },
  { slug: "interior-ai", name: "Interior AI", category: "DESIGN", websiteUrl: "https://interiorai.com", description: "AI interior design tool that reimagines room aesthetics from uploaded photos." },
  { slug: "roomgpt", name: "RoomGPT", category: "DESIGN", websiteUrl: "https://www.roomgpt.io", description: "AI room redesign tool that generates alternative interior styles from photos." },
  { slug: "banani", name: "Banani", category: "DESIGN", websiteUrl: "https://banani.co", description: "AI UI design platform for generating app and web interfaces from natural language." },
  { slug: "readdy", name: "Readdy", category: "DESIGN", websiteUrl: "https://readdy.ai", description: "AI website and app builder that creates functional designs from text descriptions." },
  { slug: "fronty", name: "Fronty", category: "DESIGN", websiteUrl: "https://fronty.com", description: "AI tool that converts image designs into clean HTML and CSS code." },
  { slug: "piktochart-ai", name: "Piktochart AI", category: "DESIGN", websiteUrl: "https://piktochart.com/ai", description: "AI infographic and presentation maker for creating visual content without design skills." },
  { slug: "mockplus-ai", name: "Mockplus AI", category: "DESIGN", websiteUrl: "https://www.mockplus.com/ai", description: "AI-powered prototyping and design collaboration platform for product teams." },
  { slug: "visual-electric", name: "Visual Electric", category: "DESIGN", websiteUrl: "https://visualelectric.com", description: "AI image generation tool optimized for designers with a focus on visual iteration." },

  // DEV
  { slug: "amazon-q", name: "Amazon Q Developer", category: "DEV", websiteUrl: "https://aws.amazon.com/q/developer", description: "AWS AI coding assistant for generating, debugging, and optimizing code." },
  { slug: "warp-ai", name: "Warp AI", category: "DEV", websiteUrl: "https://www.warp.dev", description: "AI-powered terminal with intelligent command suggestions and natural language input." },
  { slug: "gitlab-duo", name: "GitLab Duo", category: "DEV", websiteUrl: "https://about.gitlab.com/solutions/ai", description: "GitLab's AI suite for code generation, review, and DevSecOps automation." },
  { slug: "codium-ai", name: "CodiumAI", category: "DEV", websiteUrl: "https://www.codium.ai", description: "AI code testing tool that automatically generates meaningful unit tests." },
  { slug: "tabby-ml", name: "Tabby", category: "DEV", websiteUrl: "https://tabby.ml", description: "Self-hosted AI coding assistant as an open-source GitHub Copilot alternative." },
  { slug: "trae-ide", name: "Trae", category: "DEV", websiteUrl: "https://www.trae.sh", description: "AI-native IDE by ByteDance with built-in pair programming and code generation." },
  { slug: "mabl", name: "Mabl", category: "DEV", websiteUrl: "https://www.mabl.com", description: "AI-powered test automation platform for web and API testing." },
  { slug: "katalon-ai", name: "Katalon AI", category: "DEV", websiteUrl: "https://katalon.com", description: "AI-augmented test automation platform for web, mobile, and API testing." },
  { slug: "blinq-io", name: "BlinqIO", category: "DEV", websiteUrl: "https://blinq.io", description: "AI test generation tool that creates automated test scripts from user actions." },
  { slug: "applitools", name: "Applitools", category: "DEV", websiteUrl: "https://applitools.com", description: "AI visual testing platform for catching UI bugs with intelligent screenshot comparison." },
  { slug: "lambdatest-kane", name: "LambdaTest KaneAI", category: "DEV", websiteUrl: "https://www.lambdatest.com/kane-ai", description: "AI test agent that creates, runs, and maintains tests using natural language." },
  { slug: "testers-ai", name: "Testers.ai", category: "DEV", websiteUrl: "https://testers.ai", description: "AI-powered QA automation platform for continuous software testing." },
  { slug: "gitpod-flex", name: "Gitpod Flex", category: "DEV", websiteUrl: "https://www.gitpod.io", description: "Cloud development environment platform with AI-powered workspace automation." },
  { slug: "codacy-ai", name: "Codacy AI", category: "DEV", websiteUrl: "https://www.codacy.com", description: "AI-powered code quality and security platform with automated code reviews." },
  { slug: "mindsdb", name: "MindsDB", category: "DEV", websiteUrl: "https://mindsdb.com", description: "AI data layer connecting LLMs to databases for intelligent query automation." },
  { slug: "safurai", name: "Safurai", category: "DEV", websiteUrl: "https://www.safurai.com", description: "AI code assistant for generating, refactoring, and explaining code in any language." },
  { slug: "buildt", name: "Buildt", category: "DEV", websiteUrl: "https://www.buildt.ai", description: "AI codebase search and understanding tool for navigating large repositories." },
  { slug: "hume-ai", name: "Hume AI", category: "DEV", websiteUrl: "https://hume.ai", description: "Empathic AI platform providing APIs for emotional intelligence in voice and vision." },
  { slug: "sindarin", name: "Sindarin", category: "DEV", websiteUrl: "https://www.sindarin.tech", description: "Voice AI SDK for adding personalized conversational agents to any application." },
  { slug: "bloop-ai", name: "Bloop", category: "DEV", websiteUrl: "https://bloop.ai", description: "AI code search engine that understands codebases and answers developer questions." },
  { slug: "augment-code", name: "Augment Code", category: "DEV", websiteUrl: "https://www.augmentcode.com", description: "AI coding assistant deeply integrated with your codebase for accurate suggestions." },
  { slug: "zed", name: "Zed", category: "DEV", websiteUrl: "https://zed.dev", description: "High-performance code editor with built-in AI assistance and collaboration features." },
  { slug: "codegeex", name: "CodeGeeX", category: "DEV", websiteUrl: "https://codegeex.cn/en-US", description: "AI coding assistant by Tsinghua University supporting 100+ programming languages." },
  { slug: "kiro", name: "Kiro", category: "DEV", websiteUrl: "https://kiro.dev", description: "AI-powered IDE for building full-stack applications from natural language requirements." },
  { slug: "askcodi", name: "AskCodi", category: "DEV", websiteUrl: "https://www.askcodi.com", description: "AI development assistant for code generation, documentation, and testing." },
  { slug: "marscode", name: "MarsCode", category: "DEV", websiteUrl: "https://www.marscode.com", description: "AI coding assistant and cloud IDE by ByteDance for developers." },
  { slug: "codegpt", name: "CodeGPT", category: "DEV", websiteUrl: "https://codegpt.co", description: "AI coding assistant extension for VS Code with multi-model support." },
  { slug: "codemate", name: "CodeMate AI", category: "DEV", websiteUrl: "https://codemate.ai", description: "AI pair programmer that reviews, explains, and fixes code in real time." },

  // EDUCATION
  { slug: "duolingo-max", name: "Duolingo Max", category: "EDUCATION", websiteUrl: "https://www.duolingo.com", description: "AI-powered language learning subscription with GPT-4 explanations and roleplay." },
  { slug: "khanmigo", name: "Khanmigo", category: "EDUCATION", websiteUrl: "https://www.khanacademy.org/khanmigo", description: "Khan Academy's AI tutor and teaching assistant powered by GPT-4." },
  { slug: "quizlet-qchat", name: "Quizlet Q-Chat", category: "EDUCATION", websiteUrl: "https://quizlet.com", description: "AI-powered tutoring chatbot integrated into Quizlet for adaptive study sessions." },
  { slug: "socratic-by-google", name: "Socratic", category: "EDUCATION", websiteUrl: "https://socratic.org", description: "Google's AI learning app that explains subjects through visual content and step-by-step breakdowns." },
  { slug: "brainly-ai", name: "Brainly AI", category: "EDUCATION", websiteUrl: "https://brainly.com", description: "AI homework helper providing step-by-step explanations across all school subjects." },
  { slug: "studyfetch", name: "StudyFetch", category: "EDUCATION", websiteUrl: "https://www.studyfetch.com", description: "AI study platform that generates flashcards, quizzes, and summaries from uploaded notes." },
  { slug: "elsa-speak", name: "ELSA Speak", category: "EDUCATION", websiteUrl: "https://elsaspeak.com", description: "AI English pronunciation coach that provides real-time speech feedback." },
  { slug: "loora-ai", name: "Loora", category: "EDUCATION", websiteUrl: "https://loora.ai", description: "AI English speaking tutor providing personalized conversation practice." },
  { slug: "magicschool-ai", name: "MagicSchool AI", category: "EDUCATION", websiteUrl: "https://www.magicschool.ai", description: "AI platform for teachers to generate lesson plans, quizzes, and differentiated materials." },
  { slug: "caktus-ai", name: "Caktus AI", category: "EDUCATION", websiteUrl: "https://www.caktus.ai", description: "AI study assistant for students that generates essays, code, and academic content." },
  { slug: "fetchy", name: "Fetchy", category: "EDUCATION", websiteUrl: "https://www.fetchy.com", description: "AI teaching assistant for educators to streamline lesson planning and communications." },
  { slug: "speak-ai", name: "Speak", category: "EDUCATION", websiteUrl: "https://www.speak.com", description: "AI language learning app for speaking practice with real-time feedback." },
  { slug: "tutorai", name: "TutorAI", category: "EDUCATION", websiteUrl: "https://www.tutorai.me", description: "AI tutoring platform generating personalized courses on any topic instantly." },
  { slug: "knowji", name: "Knowji", category: "EDUCATION", websiteUrl: "https://www.knowji.com", description: "AI vocabulary learning app using spaced repetition and contextual examples." },
  { slug: "gradescope-ai", name: "Gradescope", category: "EDUCATION", websiteUrl: "https://www.gradescope.com", description: "AI-powered grading platform for automating assignment and exam assessment." },
  { slug: "turnitin-ai", name: "Turnitin AI", category: "EDUCATION", websiteUrl: "https://www.turnitin.com", description: "AI detection and plagiarism checker for academic integrity in education." },
  { slug: "cognii", name: "Cognii", category: "EDUCATION", websiteUrl: "https://cognii.com", description: "AI conversational tutoring system for K-12 and higher education institutions." },
  { slug: "knewton-alta", name: "Knewton Alta", category: "EDUCATION", websiteUrl: "https://www.knewton.com", description: "Adaptive learning platform providing personalized courseware for college students." },
  { slug: "century-tech", name: "Century Tech", category: "EDUCATION", websiteUrl: "https://www.century.tech", description: "AI learning platform combining neuroscience and data science for personalized education." },
  { slug: "querium", name: "Querium", category: "EDUCATION", websiteUrl: "https://www.querium.com", description: "AI STEM tutoring platform with step-by-step problem-solving guidance." },
  { slug: "babbel-ai", name: "Babbel", category: "EDUCATION", websiteUrl: "https://www.babbel.com", description: "AI-enhanced language learning platform with speech recognition and conversation practice." },
  { slug: "squirrel-ai", name: "Squirrel AI", category: "EDUCATION", websiteUrl: "https://squirrelai.com", description: "Adaptive AI tutoring system for K-12 education with personalized learning paths." },
  { slug: "memrise-ai", name: "Memrise", category: "EDUCATION", websiteUrl: "https://www.memrise.com", description: "AI language learning app using spaced repetition and real-world video content." },
  { slug: "twee-ai", name: "Twee", category: "EDUCATION", websiteUrl: "https://twee.com", description: "AI tool for English teachers to generate lessons, quizzes, and activities in seconds." },
  { slug: "yippity", name: "Yippity", category: "EDUCATION", websiteUrl: "https://yippity.io", description: "AI quiz generator that converts any text or URL into interactive Q&A sets." },
  { slug: "nolej", name: "Nolej", category: "EDUCATION", websiteUrl: "https://nolej.io", description: "AI microlearning platform generating interactive courses from existing content." },
  { slug: "wisdolia", name: "Wisdolia", category: "EDUCATION", websiteUrl: "https://wisdolia.com", description: "AI flashcard generator that creates study materials from PDFs and lecture notes." },
  { slug: "gauth", name: "Gauth", category: "EDUCATION", websiteUrl: "https://www.gauthmath.com", description: "AI math solver providing step-by-step solutions for algebra, calculus, and more." },
  { slug: "quizgecko", name: "Quizgecko", category: "EDUCATION", websiteUrl: "https://quizgecko.com", description: "AI quiz and test generator for creating assessments from any text or document." },
  { slug: "coursebox", name: "Coursebox", category: "EDUCATION", websiteUrl: "https://www.coursebox.ai", description: "AI course creation platform that builds online courses from existing content." },
  { slug: "praktika", name: "Praktika", category: "EDUCATION", websiteUrl: "https://praktika.ai", description: "AI language learning app with immersive avatar-based conversation practice." },
  { slug: "talkpal", name: "Talkpal", category: "EDUCATION", websiteUrl: "https://talkpal.ai", description: "AI language tutor for practicing speaking, listening, and grammar in real time." },
  { slug: "univerbal", name: "Univerbal", category: "EDUCATION", websiteUrl: "https://www.univerbal.app", description: "AI conversation partner app for practicing foreign languages with instant feedback." },
  { slug: "sizzle", name: "Sizzle", category: "EDUCATION", websiteUrl: "https://sizzleai.com", description: "AI tutoring app that guides students through problem-solving step by step." },
  { slug: "mindgrasp", name: "Mindgrasp", category: "EDUCATION", websiteUrl: "https://mindgrasp.ai", description: "AI learning assistant that summarizes documents, videos, and lectures into study notes." },
  { slug: "jungle", name: "Jungle", category: "EDUCATION", websiteUrl: "https://jungleai.com", description: "AI educational platform for interactive learning experiences and skill development." },
  { slug: "studyx", name: "StudyX", category: "EDUCATION", websiteUrl: "https://studyx.ai", description: "AI homework and study assistant providing solutions with detailed explanations." },
  { slug: "question-ai", name: "Question AI", category: "EDUCATION", websiteUrl: "https://questionai.com", description: "AI homework helper that answers questions across all school subjects instantly." },
  { slug: "knowt", name: "Knowt", category: "EDUCATION", websiteUrl: "https://knowt.com", description: "AI study tool that converts notes and slides into flashcards and practice tests." },
  { slug: "quizizz-ai", name: "Quizizz", category: "EDUCATION", websiteUrl: "https://quizizz.com", description: "AI quiz platform for teachers to create engaging formative assessments and games." },

  // HR_AI
  { slug: "eightfold-ai", name: "Eightfold AI", category: "HR_AI", websiteUrl: "https://eightfold.ai", description: "AI talent intelligence platform for recruiting, retention, and workforce planning." },
  { slug: "paradox-ai", name: "Paradox", category: "HR_AI", websiteUrl: "https://www.paradox.ai", description: "Conversational AI recruiting assistant automating screening, scheduling, and onboarding." },
  { slug: "beamery-ai", name: "Beamery", category: "HR_AI", websiteUrl: "https://beamery.com", description: "AI talent management platform for skills-based hiring and workforce transformation." },
  { slug: "hirevue-ai", name: "HireVue", category: "HR_AI", websiteUrl: "https://www.hirevue.com", description: "AI video interviewing and assessment platform for enterprise hiring at scale." },
  { slug: "phenom-ai", name: "Phenom", category: "HR_AI", websiteUrl: "https://www.phenom.com", description: "AI platform for talent experience covering candidates, employees, and recruiters." },
  { slug: "gem-ai", name: "Gem", category: "HR_AI", websiteUrl: "https://www.gem.com", description: "AI recruiting CRM and analytics platform for talent acquisition teams." },
  { slug: "textio", name: "Textio", category: "HR_AI", websiteUrl: "https://textio.com", description: "AI writing platform for improving job descriptions and performance feedback." },
  { slug: "seekout-ai", name: "SeekOut", category: "HR_AI", websiteUrl: "https://seekout.com", description: "AI talent search and analytics platform for sourcing diverse candidates." },
  { slug: "harver-ai", name: "Harver", category: "HR_AI", websiteUrl: "https://harver.com", description: "AI pre-employment assessment platform for high-volume hiring decisions." },
  { slug: "fetcher-ai", name: "Fetcher", category: "HR_AI", websiteUrl: "https://fetcher.ai", description: "AI recruiting automation platform for sourcing and engaging top candidates." },

  // IMAGE
  { slug: "freepik-ai", name: "Freepik AI", category: "IMAGE", websiteUrl: "https://www.freepik.com/ai", description: "AI image generation suite integrated into Freepik's creative resource platform." },
  { slug: "fotor-ai", name: "Fotor AI", category: "IMAGE", websiteUrl: "https://www.fotor.com", description: "AI photo editing and image generation platform for creating and enhancing visuals." },
  { slug: "pixlr-ai", name: "Pixlr AI", category: "IMAGE", websiteUrl: "https://pixlr.com", description: "AI-powered online photo editor with generative fill and background removal tools." },
  { slug: "gpt-image", name: "GPT Image (OpenAI)", category: "IMAGE", websiteUrl: "https://chatgpt.com", description: "OpenAI's image generation capability in ChatGPT powered by gpt-image-1 model." },
  { slug: "grok-imagine", name: "Grok Imagine", category: "IMAGE", websiteUrl: "https://x.ai", description: "xAI's image generation feature inside Grok for creating visuals from text prompts." },
  { slug: "remini-ai", name: "Remini AI", category: "IMAGE", websiteUrl: "https://remini.ai", description: "AI photo enhancer that restores old and blurry photos to high definition." },
  { slug: "faceapp-ai", name: "FaceApp AI", category: "IMAGE", websiteUrl: "https://www.faceapp.com", description: "AI face editing app for aging, gender swap, and style transformations." },
  { slug: "lensa-ai", name: "Lensa AI", category: "IMAGE", websiteUrl: "https://prisma-ai.com/lensa", description: "AI portrait and avatar generator creating artistic self-portraits from photos." },
  { slug: "invoke-ai", name: "InvokeAI", category: "IMAGE", websiteUrl: "https://invoke.com", description: "Professional AI image generation platform built on Stable Diffusion for creatives." },
  { slug: "easy-diffusion", name: "Easy Diffusion", category: "IMAGE", websiteUrl: "https://easydiffusion.github.io", description: "One-click local Stable Diffusion setup for generating AI images on your own hardware." },
  { slug: "letsenhance", name: "Let's Enhance", category: "IMAGE", websiteUrl: "https://letsenhance.io", description: "AI image upscaler for increasing resolution and quality without quality loss." },
  { slug: "mage-space", name: "Mage.space", category: "IMAGE", websiteUrl: "https://www.mage.space", description: "Free AI image generation platform with uncensored Stable Diffusion models." },
  { slug: "bria-ai", name: "Bria AI", category: "IMAGE", websiteUrl: "https://bria.ai", description: "AI visual generation platform for enterprises with commercially licensed content." },
  { slug: "photor-ai", name: "Photor AI", category: "IMAGE", websiteUrl: "https://photor.io", description: "AI photo selector that analyzes and ranks your best photos automatically." },

  // INFRA
  { slug: "vultr-gpu", name: "Vultr Cloud GPU", category: "INFRA", websiteUrl: "https://www.vultr.com/products/cloud-gpu", description: "Cloud GPU infrastructure for AI training and inference workloads." },
  { slug: "nebius-ai", name: "Nebius AI", category: "INFRA", websiteUrl: "https://nebius.ai", description: "AI cloud infrastructure platform offering GPU clusters for training and inference." },
  { slug: "ovh-ai", name: "OVHcloud AI", category: "INFRA", websiteUrl: "https://www.ovhcloud.com/en/public-cloud/ai-machine-learning", description: "OVHcloud's AI and machine learning services built on open-source tools." },
  { slug: "crusoe-energy", name: "Crusoe", category: "INFRA", websiteUrl: "https://www.crusoe.ai", description: "Sustainable AI cloud computing using stranded energy for GPU workloads." },
  { slug: "fluidstack", name: "FluidStack", category: "INFRA", websiteUrl: "https://www.fluidstack.io", description: "Distributed GPU cloud for AI training with cost-efficient global infrastructure." },
  { slug: "baidu-ai-cloud", name: "Baidu AI Cloud", category: "INFRA", websiteUrl: "https://intl.cloud.baidu.com", description: "Baidu's cloud platform offering AI services, GPU compute, and Ernie Bot APIs." },
  { slug: "softbank-genai", name: "SoftBank GenAI", category: "INFRA", websiteUrl: "https://www.softbank.jp", description: "SoftBank's generative AI infrastructure and enterprise AI solutions for Japan." },
  { slug: "truefoundry", name: "TrueFoundry", category: "INFRA", websiteUrl: "https://www.truefoundry.com", description: "ML platform for deploying, scaling, and monitoring AI models on any cloud." },
  { slug: "inferless", name: "Inferless", category: "INFRA", websiteUrl: "https://www.inferless.com", description: "Serverless GPU inference platform for deploying ML models with auto-scaling." },
  { slug: "nscale", name: "Nscale", category: "INFRA", websiteUrl: "https://www.nscale.com", description: "UK-based AI cloud provider offering dedicated GPU compute for AI workloads." },
  { slug: "akash-network", name: "Akash Network", category: "INFRA", websiteUrl: "https://akash.network", description: "Decentralized cloud computing marketplace for deploying AI and web workloads." },

  // LEGAL_AI
  { slug: "harvey-ai", name: "Harvey", category: "LEGAL_AI", websiteUrl: "https://www.harvey.ai", description: "AI legal platform for law firms and legal departments to automate complex work." },
  { slug: "casetext-cocounsel", name: "CoCounsel", category: "LEGAL_AI", websiteUrl: "https://casetext.com", description: "AI legal research assistant by Casetext for drafting, reviewing, and analyzing documents." },
  { slug: "robin-ai", name: "Robin AI", category: "LEGAL_AI", websiteUrl: "https://www.robinai.com", description: "AI contract review and drafting platform for faster and safer legal agreements." },
  { slug: "spellbook-ai", name: "Spellbook", category: "LEGAL_AI", websiteUrl: "https://www.spellbook.legal", description: "AI contract drafting tool built inside Microsoft Word for legal teams." },
  { slug: "luminance-ai", name: "Luminance", category: "LEGAL_AI", websiteUrl: "https://www.luminance.com", description: "AI legal document analysis platform for contract review and due diligence." },
  { slug: "ironclad-ai", name: "Ironclad", category: "LEGAL_AI", websiteUrl: "https://ironcladapp.com", description: "AI-powered contract lifecycle management platform for enterprise legal teams." },
  { slug: "vlex-ai", name: "vLex", category: "LEGAL_AI", websiteUrl: "https://vlex.com", description: "AI legal research platform with global case law, legislation, and secondary sources." },
  { slug: "juro-ai", name: "Juro", category: "LEGAL_AI", websiteUrl: "https://juro.com", description: "AI contract management platform for automating contract creation and signing." },
  { slug: "eve-legal", name: "Eve", category: "LEGAL_AI", websiteUrl: "https://www.eve.legal", description: "AI legal assistant for answering questions, drafting documents, and research." },
  { slug: "do-not-pay", name: "DoNotPay", category: "LEGAL_AI", websiteUrl: "https://donotpay.com", description: "AI legal services robot helping consumers fight corporations and bureaucracy." },

  // LLM
  { slug: "jais-ai", name: "Jais (Inception)", category: "LLM", websiteUrl: "https://www.inceptioniai.org", description: "Arabic-English bilingual LLM developed by Inception Institute of Artificial Intelligence." },
  { slug: "upstage-solar", name: "Upstage Solar", category: "LLM", websiteUrl: "https://www.upstage.ai", description: "High-performance compact LLM by Upstage optimized for enterprise applications." },
  { slug: "wizardlm", name: "WizardLM", category: "LLM", websiteUrl: "https://wizardlm.github.io", description: "Microsoft Research's instruction-following LLM trained with Evol-Instruct methodology." },
  { slug: "nous-hermes", name: "Nous Hermes", category: "LLM", websiteUrl: "https://nousresearch.com", description: "Fine-tuned open-source LLMs by Nous Research optimized for instruction following." },
  { slug: "naver-clova", name: "NAVER CLOVA", category: "LLM", websiteUrl: "https://clova.ai", description: "NAVER's AI platform offering language, vision, and speech AI services for Asia." },
  { slug: "line-ai", name: "LINE AI", category: "LLM", websiteUrl: "https://line.me/en/ai", description: "LINE's AI services integrating language models into the messaging platform." },
  { slug: "h2o-ai", name: "H2O.ai", category: "LLM", websiteUrl: "https://h2o.ai", description: "Open-source AI platform with AutoML and enterprise LLM solutions." },
  { slug: "aleph-alpha", name: "Aleph Alpha", category: "LLM", websiteUrl: "https://aleph-alpha.com", description: "European sovereign AI company providing multimodal LLMs and enterprise AI infrastructure." },
  { slug: "corcel-io", name: "Corcel", category: "LLM", websiteUrl: "https://corcel.io", description: "Decentralized AI API platform built on the Bittensor network for LLM access." },
  { slug: "writesmith", name: "Writesmith", category: "LLM", websiteUrl: "https://writesmith.ai", description: "AI writing assistant powered by advanced LLMs for content creation." },

  // MARKETING
  { slug: "copysmith", name: "Copysmith", category: "MARKETING", websiteUrl: "https://copysmith.ai", description: "AI copywriting platform for enterprise marketing and ecommerce content generation." },
  { slug: "mutiny-ai", name: "Mutiny", category: "MARKETING", websiteUrl: "https://www.mutinyhq.com", description: "AI website personalization platform for B2B companies to convert target accounts." },
  { slug: "peppertype-ai", name: "Peppertype", category: "MARKETING", websiteUrl: "https://www.peppercontent.io", description: "AI content creation platform for marketing teams to generate and scale content." },
  { slug: "predis-ai", name: "Predis.ai", category: "MARKETING", websiteUrl: "https://predis.ai", description: "AI social media content generator for creating posts, reels, and ad creatives." },
  { slug: "wordtune", name: "Wordtune", category: "MARKETING", websiteUrl: "https://www.wordtune.com", description: "AI writing tool for rephrasing, summarizing, and enhancing written content." },
  { slug: "hypotenuse-ai", name: "Hypotenuse AI", category: "MARKETING", websiteUrl: "https://www.hypotenuse.ai", description: "AI content writing platform for ecommerce product descriptions and blog posts." },
  { slug: "writecream", name: "Writecream", category: "MARKETING", websiteUrl: "https://www.writecream.com", description: "AI marketing content generator for icebreakers, ads, and personalized outreach." },
  { slug: "copy-matic", name: "Copymatic", category: "MARKETING", websiteUrl: "https://copymatic.ai", description: "AI copywriting tool for generating website copy, blog posts, and digital ads." },
  { slug: "seamless-ai", name: "Seamless.AI", category: "MARKETING", websiteUrl: "https://seamless.ai", description: "AI sales intelligence platform for finding and verifying B2B contact information." },

  // MLOPS
  { slug: "honeyhive-ai", name: "HoneyHive", category: "MLOPS", websiteUrl: "https://honeyhive.ai", description: "AI evaluation and observability platform for monitoring LLM application performance." },
  { slug: "context-ai", name: "Context.ai", category: "MLOPS", websiteUrl: "https://context.ai", description: "LLM product analytics platform for understanding user conversations and behavior." },
  { slug: "smithery-ai", name: "Smithery", category: "MLOPS", websiteUrl: "https://smithery.ai", description: "MCP server registry and deployment platform for AI agent tool integrations." },
  { slug: "laminar-ai", name: "Laminar", category: "MLOPS", websiteUrl: "https://www.lmnr.ai", description: "Open-source LLM engineering platform for tracing, evaluating, and labeling AI pipelines." },
  { slug: "patronus-ai", name: "Patronus AI", category: "MLOPS", websiteUrl: "https://www.patronus.ai", description: "AI evaluation platform for automated testing and red-teaming of LLM applications." },
  { slug: "cleanlab", name: "Cleanlab", category: "MLOPS", websiteUrl: "https://cleanlab.ai", description: "AI data quality platform for finding and fixing label errors in ML training datasets." },
  { slug: "lakera", name: "Lakera", category: "MLOPS", websiteUrl: "https://lakera.ai", description: "AI security platform protecting LLM applications from prompt injection and jailbreaks." },
  { slug: "giskard", name: "Giskard", category: "MLOPS", websiteUrl: "https://giskard.ai", description: "Open-source AI quality testing platform for detecting LLM vulnerabilities and biases." },
  { slug: "maxim-ai", name: "Maxim AI", category: "MLOPS", websiteUrl: "https://www.getmaxim.ai", description: "AI quality assurance platform for testing, evaluating, and monitoring AI applications." },
  { slug: "parea-ai", name: "Parea AI", category: "MLOPS", websiteUrl: "https://www.parea.ai", description: "LLM development tools for prompt engineering, testing, and observability." },
  { slug: "raga-ai", name: "Raga AI", category: "MLOPS", websiteUrl: "https://www.raga.ai", description: "AI testing and evaluation platform for ensuring reliable LLM application performance." },
  { slug: "kolena", name: "Kolena", category: "MLOPS", websiteUrl: "https://www.kolena.com", description: "ML testing platform for measuring and improving model performance on real-world data." },
  { slug: "nannyml", name: "NannyML", category: "MLOPS", websiteUrl: "https://nannyml.com", description: "Open-source ML monitoring library for detecting model performance degradation." },
  { slug: "confident-ai", name: "Confident AI", category: "MLOPS", websiteUrl: "https://www.confident-ai.com", description: "LLM evaluation and regression testing platform for building reliable AI products." },
  { slug: "valohai", name: "Valohai", category: "MLOPS", websiteUrl: "https://valohai.com", description: "MLOps platform for orchestrating machine learning pipelines across any infrastructure." },

  // PRODUCTIVITY
  { slug: "taskade-ai", name: "Taskade AI", category: "PRODUCTIVITY", websiteUrl: "https://www.taskade.com", description: "AI productivity platform combining task management, notes, and AI agents in one workspace." },
  { slug: "durable-ai", name: "Durable", category: "PRODUCTIVITY", websiteUrl: "https://durable.co", description: "AI website builder and business platform for creating complete websites in seconds." },
  { slug: "mem-ai", name: "Mem", category: "PRODUCTIVITY", websiteUrl: "https://mem.ai", description: "AI-powered note-taking app that self-organizes and surfaces relevant information." },
  { slug: "magical-ai-prod", name: "Magical", category: "PRODUCTIVITY", websiteUrl: "https://www.getmagical.com", description: "AI automation tool for repetitive text, data entry, and browser workflows." },
  { slug: "rakuten-ai", name: "Rakuten AI", category: "PRODUCTIVITY", websiteUrl: "https://rakuten.today", description: "Rakuten's AI productivity suite for enterprise workflow automation." },
  { slug: "photomath-ai", name: "Photomath AI", category: "PRODUCTIVITY", websiteUrl: "https://photomath.com", description: "AI math solver that reads handwritten and printed equations via camera." },
  { slug: "granola", name: "Granola", category: "PRODUCTIVITY", websiteUrl: "https://www.granola.ai", description: "AI meeting notepad that transcribes and enhances your own notes from meetings." },
  { slug: "guidde", name: "Guidde", category: "PRODUCTIVITY", websiteUrl: "https://www.guidde.com", description: "AI documentation platform that generates video guides from screen recordings." },
  { slug: "monica-ai", name: "Monica", category: "PRODUCTIVITY", websiteUrl: "https://monica.im", description: "AI assistant browser extension combining ChatGPT, search, and translation in one." },
  { slug: "harpa-ai", name: "Harpa AI", category: "PRODUCTIVITY", websiteUrl: "https://harpa.ai", description: "AI browser automation agent for web scraping, monitoring, and task automation." },
  { slug: "shortwave", name: "Shortwave", category: "PRODUCTIVITY", websiteUrl: "https://www.shortwave.com", description: "AI email client that summarizes, drafts, and organizes your inbox intelligently." },
  { slug: "tana", name: "Tana", category: "PRODUCTIVITY", websiteUrl: "https://tana.inc", description: "AI-powered structured note-taking tool combining outlines, databases, and AI agents." },
  { slug: "wispr-flow", name: "Wispr Flow", category: "PRODUCTIVITY", websiteUrl: "https://wisprflow.ai", description: "AI voice dictation tool that transcribes speech into text anywhere on your screen." },
  { slug: "meetgeek", name: "MeetGeek", category: "PRODUCTIVITY", websiteUrl: "https://meetgeek.ai", description: "AI meeting assistant that records, transcribes, and summarizes video meetings." },
  { slug: "superwhisper", name: "Superwhisper", category: "PRODUCTIVITY", websiteUrl: "https://superwhisper.com", description: "Mac AI voice dictation app using Whisper for fast, accurate transcription." },
  { slug: "notegpt", name: "NoteGPT", category: "PRODUCTIVITY", websiteUrl: "https://notegpt.io", description: "AI note-taking and summarization tool for YouTube videos, PDFs, and web pages." },
  { slug: "humata", name: "Humata", category: "PRODUCTIVITY", websiteUrl: "https://www.humata.ai", description: "AI document Q&A tool for asking questions and getting insights from any PDF." },

  // ROLEPLAY
  { slug: "botify-ai-rp", name: "Botify AI", category: "ROLEPLAY", websiteUrl: "https://botify.ai", description: "AI character chat platform for creating and interacting with custom AI personas." },
  { slug: "candy-ai", name: "Candy AI", category: "ROLEPLAY", websiteUrl: "https://candy.ai", description: "AI companion and roleplay platform for creating personalized virtual relationships." },
  { slug: "pephop-ai", name: "Pephop AI", category: "ROLEPLAY", websiteUrl: "https://pephop.ai", description: "AI character chat platform with anime and fictional persona roleplay scenarios." },
  { slug: "moemate", name: "Moemate", category: "ROLEPLAY", websiteUrl: "https://www.moemate.io", description: "AI companion app with animated avatars for personalized conversation and roleplay." },
  { slug: "faraday-dev", name: "Faraday.dev", category: "ROLEPLAY", websiteUrl: "https://faraday.dev", description: "Local AI companion and roleplay app running open-source models privately on device." },
  { slug: "agnai", name: "Agnai", category: "ROLEPLAY", websiteUrl: "https://agnai.chat", description: "Open-source multi-user AI roleplay platform supporting multiple LLM backends." },
  { slug: "sillytavern", name: "SillyTavern", category: "ROLEPLAY", websiteUrl: "https://sillytavernapp.com", description: "Feature-rich AI chat interface for roleplay with support for all major LLM APIs." },
  { slug: "figgs-ai", name: "Figgs AI", category: "ROLEPLAY", websiteUrl: "https://www.figgs.ai", description: "AI platform for building and chatting with custom character personas." },
  { slug: "kajiwoto", name: "Kajiwoto", category: "ROLEPLAY", websiteUrl: "https://kajiwoto.ai", description: "AI companion creation platform for building personalized AI friends and characters." },
  { slug: "chub-ai", name: "Chub AI", category: "ROLEPLAY", websiteUrl: "https://chub.ai", description: "Community hub for AI character cards and roleplay persona sharing." },
  { slug: "muah-ai", name: "Muah AI", category: "ROLEPLAY", websiteUrl: "https://muah.ai", description: "AI companion platform offering unfiltered character chat and relationship simulation." },
  { slug: "holoworld-ai", name: "Holoworld", category: "ROLEPLAY", websiteUrl: "https://www.holoworld.app", description: "AI avatar creation platform for building interactive 3D character companions." },
  { slug: "harpy-chat", name: "Harpy Chat", category: "ROLEPLAY", websiteUrl: "https://harpy.chat", description: "AI character roleplay platform with anime-style personas and story scenarios." },
  { slug: "inworld-ai", name: "Inworld AI", category: "ROLEPLAY", websiteUrl: "https://www.inworld.ai", description: "AI character engine for creating intelligent NPCs and interactive game characters." },
  { slug: "mate-ai", name: "Mate AI", category: "ROLEPLAY", websiteUrl: "https://mate.ai", description: "AI companion app for personalized conversations and virtual relationship experiences." },
  { slug: "risuai", name: "RisuAI", category: "ROLEPLAY", websiteUrl: "https://risuai.xyz", description: "Open-source AI roleplay client supporting custom characters and multiple LLM backends." },
  { slug: "chatfai", name: "ChatFAI", category: "ROLEPLAY", websiteUrl: "https://chatfai.com", description: "AI chat platform for conversing with fictional, historical, and celebrity characters." },
  { slug: "ai-dungeon", name: "AI Dungeon", category: "ROLEPLAY", websiteUrl: "https://aidungeon.com", description: "AI-powered interactive text adventure game for infinite storytelling possibilities." },
  { slug: "fables-gg", name: "Fables.gg", category: "ROLEPLAY", websiteUrl: "https://fables.gg", description: "AI storytelling platform for collaborative fiction and character-driven narratives." },
  { slug: "roleplai", name: "RolePlai", category: "ROLEPLAY", websiteUrl: "https://www.roleplai.app", description: "Mobile AI roleplay app for creating and chatting with custom AI characters." },
  { slug: "nectar-ai", name: "Nectar AI", category: "ROLEPLAY", websiteUrl: "https://trynectar.ai", description: "AI companion platform for personalized character creation and interaction." },
  { slug: "juicychat", name: "JuicyChat AI", category: "ROLEPLAY", websiteUrl: "https://juicychat.ai", description: "AI character chat platform for adult roleplay and companion interactions." },
  { slug: "dreamgf", name: "DreamGF", category: "ROLEPLAY", websiteUrl: "https://dreamgf.ai", description: "AI girlfriend simulation platform for personalized virtual companion experiences." },
  { slug: "girlfriendgpt", name: "GirlfriendGPT", category: "ROLEPLAY", websiteUrl: "https://girlfriendgpt.com", description: "AI companion platform for customizable virtual girlfriend and relationship simulation." },
  { slug: "questie", name: "Questie", category: "ROLEPLAY", websiteUrl: "https://www.questie.ai", description: "AI quest and adventure game platform for interactive storytelling experiences." },

  // SEARCH
  { slug: "arc-search", name: "Arc Search", category: "SEARCH", websiteUrl: "https://arc.net", description: "AI-powered mobile browser that browses for you and summarizes web results." },
  { slug: "voyage-ai", name: "Voyage AI", category: "SEARCH", websiteUrl: "https://www.voyageai.com", description: "State-of-the-art embedding models and rerankers for search and RAG applications." },
  { slug: "dashworks", name: "Dashworks", category: "SEARCH", websiteUrl: "https://www.dashworks.ai", description: "AI knowledge search platform connecting all company apps for instant answers." },
  { slug: "elicit", name: "Elicit", category: "SEARCH", websiteUrl: "https://elicit.com", description: "AI research assistant for finding, summarizing, and analyzing academic papers." },
  { slug: "afforai", name: "Afforai", category: "SEARCH", websiteUrl: "https://afforai.com", description: "AI research tool for searching, summarizing, and chatting with multiple documents." },
  { slug: "nuclia", name: "Nuclia", category: "SEARCH", websiteUrl: "https://nuclia.com", description: "AI search platform for building semantic search into any application or knowledge base." },

  // SUPPORT
  { slug: "netomi", name: "Netomi", category: "SUPPORT", websiteUrl: "https://www.netomi.com", description: "AI customer service platform automating email, chat, and voice support at scale." },
  { slug: "gladly-hero", name: "Gladly Hero", category: "SUPPORT", websiteUrl: "https://www.gladly.com", description: "AI-powered customer service platform combining human agents and AI for personalized support." },
  { slug: "polyai-voice", name: "PolyAI", category: "SUPPORT", websiteUrl: "https://poly.ai", description: "Conversational voice AI platform for enterprise call center automation." },
  { slug: "kore-ai", name: "Kore.ai", category: "SUPPORT", websiteUrl: "https://kore.ai", description: "Enterprise AI platform for building conversational and generative AI-powered virtual assistants." },
  { slug: "decagon", name: "Decagon", category: "SUPPORT", websiteUrl: "https://decagon.ai", description: "AI customer support agent that resolves tickets using company knowledge autonomously." },
  { slug: "sierra", name: "Sierra", category: "SUPPORT", websiteUrl: "https://sierra.ai", description: "Conversational AI platform for deploying brand-aligned customer service agents." },
  { slug: "parloa", name: "Parloa", category: "SUPPORT", websiteUrl: "https://www.parloa.com", description: "AI contact center platform automating phone and chat customer interactions." },
  { slug: "cresta", name: "Cresta", category: "SUPPORT", websiteUrl: "https://cresta.com", description: "AI coaching and automation platform for contact center performance improvement." },
  { slug: "aisera", name: "Aisera", category: "SUPPORT", websiteUrl: "https://aisera.com", description: "Generative AI platform for IT, HR, and customer service automation." },
  { slug: "asapp", name: "ASAPP", category: "SUPPORT", websiteUrl: "https://www.asapp.com", description: "AI platform for contact centers improving agent efficiency and customer experience." },
  { slug: "maven-agi", name: "Maven AGI", category: "SUPPORT", websiteUrl: "https://www.mavenagi.com", description: "AI-powered customer support platform resolving complex inquiries autonomously." },
  { slug: "yuma-ai", name: "Yuma AI", category: "SUPPORT", websiteUrl: "https://yuma.ai", description: "AI customer support automation for Shopify merchants handling tickets at scale." },
  { slug: "ultimate", name: "Ultimate", category: "SUPPORT", websiteUrl: "https://www.ultimate.ai", description: "Conversational AI platform for automating customer support across chat and email channels." },

  // THREE_D
  { slug: "rodin-3d", name: "Rodin (Deemos)", category: "THREE_D", websiteUrl: "https://hyperhuman.deemos.com/rodin", description: "AI 3D model generation service creating high-quality meshes from text and images." },
  { slug: "plask-ai", name: "Plask", category: "THREE_D", websiteUrl: "https://plask.ai", description: "AI motion capture and 3D animation tool for extracting movement from videos." },
  { slug: "kinetix", name: "Kinetix", category: "THREE_D", websiteUrl: "https://www.kinetix.tech", description: "AI 3D animation platform for generating game-ready character animations from video." },
  { slug: "cascadeur", name: "Cascadeur", category: "THREE_D", websiteUrl: "https://cascadeur.com", description: "AI-assisted 3D animation software for creating physically realistic character movements." },
  { slug: "promethean-ai", name: "Promethean AI", category: "THREE_D", websiteUrl: "https://www.prometheanai.com", description: "AI virtual world building tool for game developers and VR creators." },
  { slug: "polycam-ai", name: "Polycam", category: "THREE_D", websiteUrl: "https://poly.cam", description: "AI 3D scanning app for capturing real-world objects and spaces as 3D models." },
  { slug: "lumirithmic", name: "Lumirithmic", category: "THREE_D", websiteUrl: "https://www.lumirithmic.com", description: "AI facial reconstruction technology for creating photorealistic 3D head models." },
  { slug: "alpha3d", name: "Alpha3D", category: "THREE_D", websiteUrl: "https://www.alpha3d.io", description: "AI platform converting 2D product images into 3D models for ecommerce and gaming." },
  { slug: "womp-3d", name: "Womp", category: "THREE_D", websiteUrl: "https://womp.com", description: "Browser-based 3D modeling tool with AI-assisted shape creation for beginners." },
  { slug: "in3d", name: "in3D", category: "THREE_D", websiteUrl: "https://in3d.io", description: "AI avatar creation platform for generating full-body 3D avatars from phone scans." },
  { slug: "anything-world", name: "Anything World", category: "THREE_D", websiteUrl: "https://anything.world", description: "AI 3D animation platform for bringing any 3D model to life with behaviors." },
  { slug: "avaturn", name: "Avaturn", category: "THREE_D", websiteUrl: "https://avaturn.me", description: "AI avatar generator creating photorealistic 3D avatars from a single selfie." },
  { slug: "krikey-ai", name: "Krikey AI", category: "THREE_D", websiteUrl: "https://www.krikey.ai", description: "AI animation tools for generating 3D character animations from text and video." },
  { slug: "viverse-create", name: "VIVERSE Create", category: "THREE_D", websiteUrl: "https://create.viverse.com", description: "HTC's AI-powered metaverse creation platform for 3D virtual experiences." },
  { slug: "immersity-ai", name: "Immersity AI", category: "THREE_D", websiteUrl: "https://www.immersity.ai", description: "AI platform converting 2D images and videos into immersive 3D content." },
  { slug: "backflip-ai", name: "Backflip AI", category: "THREE_D", websiteUrl: "https://www.backflip.ai", description: "AI 3D model generation from text prompts for product design and prototyping." },

  // VECTOR_DB
  { slug: "txtai-neuml", name: "txtai", category: "VECTOR_DB", websiteUrl: "https://neuml.github.io/txtai", description: "Open-source AI search engine and vector database pipeline built for semantic search." },
  { slug: "aerospike-vector", name: "Aerospike Vector Search", category: "VECTOR_DB", websiteUrl: "https://aerospike.com", description: "Real-time vector search integrated with Aerospike's high-performance database." },
  { slug: "kdb-ai", name: "KDB.AI", category: "VECTOR_DB", websiteUrl: "https://kdb.ai", description: "Time-series and vector database for real-time AI applications and analytics." },
  { slug: "couchbase-capella", name: "Couchbase Capella", category: "VECTOR_DB", websiteUrl: "https://www.couchbase.com/products/capella", description: "Cloud database platform with integrated vector search for AI and mobile apps." },
  { slug: "timescale-vector", name: "Timescale Vector", category: "VECTOR_DB", websiteUrl: "https://www.timescale.com/ai", description: "PostgreSQL extension for vector similarity search optimized for time-series AI data." },
  { slug: "oracle-ai-vector-search", name: "Oracle AI Vector Search", category: "VECTOR_DB", websiteUrl: "https://www.oracle.com/artificial-intelligence/generative-ai/vector-search", description: "Oracle's native vector database capability integrated into Oracle Database 23ai." },

  // VIDEO
  { slug: "pixverse", name: "PixVerse", category: "VIDEO", websiteUrl: "https://pixverse.ai", description: "AI video generation platform for creating high-quality videos from text and images." },
  { slug: "colossyan", name: "Colossyan", category: "VIDEO", websiteUrl: "https://www.colossyan.com", description: "AI video generation platform with custom avatars for workplace learning and training." },
  { slug: "dreamina", name: "Dreamina (ByteDance)", category: "VIDEO", websiteUrl: "https://dreamina.capcut.com", description: "ByteDance's AI creative platform for image and video generation from text prompts." },
  { slug: "tavus-ai", name: "Tavus", category: "VIDEO", websiteUrl: "https://www.tavus.ai", description: "AI video personalization platform for generating unique videos for every viewer." },
  { slug: "hedra-video", name: "Hedra", category: "VIDEO", websiteUrl: "https://www.hedra.com", description: "AI character animation platform for creating expressive talking avatar videos." },
  { slug: "ltx-studio", name: "LTX Studio", category: "VIDEO", websiteUrl: "https://ltx.studio", description: "AI filmmaking platform for generating cinematic videos with full creative control." },
  { slug: "wonder-share-virbo", name: "Virbo (Wondershare)", category: "VIDEO", websiteUrl: "https://virbo.wondershare.com", description: "AI avatar video generator for creating multilingual spokesperson videos at scale." },
  { slug: "hour-one", name: "Hour One", category: "VIDEO", websiteUrl: "https://hourone.ai", description: "AI video generation platform for creating professional presenter videos from text." },
  { slug: "shuffll", name: "Shuffll", category: "VIDEO", websiteUrl: "https://shuffll.com", description: "AI video production platform for creating branded marketing videos quickly." },
  { slug: "oxolo", name: "Oxolo", category: "VIDEO", websiteUrl: "https://www.oxolo.com", description: "AI ecommerce video generator creating product marketing videos from URLs." },
];

async function main() {
  console.log(`Starting insertion of ${NEW_SERVICES.length} services...`);
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const svc of NEW_SERVICES) {
    try {
      const existing = await prisma.service.findUnique({ where: { slug: svc.slug } });
      if (existing) {
        console.log(`SKIP (exists): ${svc.slug}`);
        skipped++;
        continue;
      }

      await prisma.service.create({
        data: {
          slug: svc.slug,
          name: svc.name,
          category: svc.category,
          tier: 2,
          defaultBadge: "COMMUNITY_REPORTS" as BadgeType,
          limitPhraseKey: "default",
          websiteUrl: svc.websiteUrl,
          description: svc.description,
          surfaces: {
            create: {
              slug: `${svc.slug}-web`,
              displayName: `${svc.name} Web`,
              isEnabled: true,
              checkUrl: svc.websiteUrl,
            },
          },
        },
      });
      console.log(`OK: ${svc.slug}`);
      inserted++;
    } catch (err: unknown) {
      console.error(`ERROR: ${svc.slug} — ${err instanceof Error ? err.message : String(err)}`);
      errors++;
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
