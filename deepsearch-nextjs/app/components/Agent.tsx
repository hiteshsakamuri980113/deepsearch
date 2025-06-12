"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";

interface AgentProps {
  // You can add props here if needed in the future
}

export default function Agent({}: AgentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling to avoid interference with drag
    }
    setIsModalOpen(false);
    setIsDragging(false);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !modalRef.current) return;

      const modal = modalRef.current;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep modal within viewport bounds
      const maxX = window.innerWidth - modal.offsetWidth;
      const maxY = window.innerHeight - modal.offsetHeight;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      modal.style.left = `${boundedX}px`;
      modal.style.top = `${boundedY}px`;
      modal.style.transform = "none";
    },
    [isDragging, dragOffset.x, dragOffset.y]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const modal = modalRef.current;
    const header = headerRef.current;
    const target = e.target as HTMLElement;

    if (!modal || !header) return;

    // Don't start dragging if clicking on the close button
    if (target.tagName === "BUTTON" || target.textContent === "×") {
      return;
    }

    // Check if click is on header (but not on close button)
    if (header.contains(target)) {
      setIsDragging(true);

      const rect = modal.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Add event listeners for mouse move and up when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none"; // Prevent text selection while dragging
      document.body.style.cursor = "grabbing"; // Change cursor globally while dragging
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Initialize modal position when opened
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      const modal = modalRef.current;
      // Reset any previous dragging styles
      modal.style.left = "50%";
      modal.style.top = "20%";
      modal.style.transform = "translate(-50%, -20%)";
    }
  }, [isModalOpen]);

  return (
    <div>
      {/* Chat Button */}
      <button
        className="fixed bottom-5 right-5 z-[1000] bg-[#1e1e1e] text-[#a8f0e8] border-none rounded-full px-6 py-3 text-base font-bold cursor-pointer transition-all duration-300 shadow-[0_0_4px_2px_#a8f0e8,0_0_20px_8px_#6ee7b7] animate-sparkle-border hover:bg-[#2a2a2a] hover:text-[#6ee7b7] hover:scale-110 hover:shadow-[0_0_8px_4px_#6ee7b7,0_0_30px_12px_#a8f0e8]"
        onClick={openModal}
      >
        Chat with Agent
      </button>

      {/* Modal Window */}
      {isModalOpen && (
        <div
          className="fixed w-[500px] h-[600px] bg-[#1e1e1e] text-[#a8f0e8] border-2 border-[#a8f0e8] rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.3)] overflow-hidden z-[2000]"
          ref={modalRef}
          onMouseDown={handleMouseDown}
          style={{
            left: "50%",
            top: "20%",
            transform: "translate(-50%, -20%)",
          }}
        >
          {/* Header */}
          <div
            ref={headerRef}
            className={`bg-[#2a2a2a] text-[#a8f0e8] p-[10px] text-lg font-bold flex justify-between items-center select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <span>AI Agent</span>
            <button
              className="bg-transparent border-none text-[#a8f0e8] text-xl cursor-pointer transition-colors duration-300 hover:text-[#6ee7b7] p-1 leading-none"
              onClick={closeModal}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag from starting
            >
              ×
            </button>
          </div>

          {/* Chat Interface */}
          <iframe
            src={process.env.PYTHON_AGENT_URL || "http://127.0.0.1:8000"}
            title="AI Agent"
            className="w-full h-[calc(100%-40px)] border-none bg-[#1e1e1e] pointer-events-auto"
          />
        </div>
      )}

      <style jsx>{`
        @keyframes sparkle-border {
          0% {
            box-shadow: 0 0 10px 4px #a8f0e8, 0 0 20px 8px #6ee7b7;
          }
          25% {
            box-shadow: 0 0 12px 5px #6ee7b7, 0 0 24px 10px #a8f0e8;
          }
          50% {
            box-shadow: 0 0 15px 6px #a8f0e8, 0 0 30px 12px #6ee7b7;
          }
          75% {
            box-shadow: 0 0 12px 5px #6ee7b7, 0 0 24px 10px #a8f0e8;
          }
          100% {
            box-shadow: 0 0 10px 4px #a8f0e8, 0 0 20px 8px #6ee7b7;
          }
        }
        .animate-sparkle-border {
          animation: sparkle-border 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
