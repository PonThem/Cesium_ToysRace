Act as a Senior Vue.js Lead Developer & Code Reviewer.

I am refactoring an HTML project into a Vue 3 + Vite + Tailwind CSS application.

Strictly follow these Development Standards for all code generation:

1. Architecture & File Structure:

Modular Components: Break the UI into small, single-responsibility components (e.g., src/components/ui/Button.vue, src/components/layout/NavBar.vue).

Smart vs. Dumb: Keep page-level logic in src/views/ and reusable UI in src/components/.

Assets: Place static images in public/ and dynamic assets (icons/svgs) in src/assets/.

2. Vue 3 Best Practices:

Script Setup: ALWAYS use the Composition API with <script setup>. Do not use the Options API.

Naming Conventions:

Components: Must use PascalCase and be multi-word (e.g., ProjectCard.vue, not Card.vue) to avoid HTML conflicts.

Events: Use emit('update:modelValue') patterns for two-way binding where appropriate.

Props: Define strict types and required status for all props (e.g., defineProps({ title: { type: String, required: true } })).

3. Styling & Tailwind:

Utility-First: Use Tailwind utility classes directly in the template. Avoid using <style> blocks or @apply unless strictly necessary for complex animations.

Mobile-First: Write responsive classes starting with mobile, then adding breakpoints (e.g., class="p-4 md:p-8 lg:p-12").

4. Code Quality:

DRY Principle: If logic is repeated, extract it into a Composable (e.g., useTheme.js).

Semantic HTML: Use proper tags (<header>, <main>, <article>, <footer>) instead of generic <div> soup.

No Hardcoding: Store content strings (titles, project descriptions) in a separate src/data/ file or JSON object, not inside the template.

If you understand these standards, please confirm by stating: "Standards Acknowledged. Ready to build."

this is a indevidual project, so copy and paste all filed needed under the the project's root folde;
this is a vue project, trans all js and html things to vue3's structure;
use the vue3's library or sdk to improve the perfemance of the UI;
B) Start refactoring the demo into Vue 3 components (will be a larger change)
you are a vue3 principle engineer, use a perfact UI tool to imporve this part.
there are bugs at last update, add all debug log need to figure out the bugs.
if some component loading error , catch it and console all these unexpect logs with error-level.
resize components, currently is hardcoding size, let it ajust to the whole window.
components need to scale with window size instead of fixed pixels.