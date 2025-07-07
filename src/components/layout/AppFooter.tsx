export const AppFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-4 mt-auto">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          © Copyright 2025 | All Rights Reserved | Created by{' '}
          <a 
            href="https://jjay.info" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 underline decoration-primary/30 hover:decoration-primary/60"
          >
            JJAY TECH RESOURCES
          </a>
        </p>
      </div>
    </footer>
  );
};