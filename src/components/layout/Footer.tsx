export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto max-w-[1300px] px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>
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
      </div>
    </footer>
  );
};