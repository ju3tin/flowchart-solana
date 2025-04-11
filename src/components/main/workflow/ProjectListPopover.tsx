import React, { useState, useEffect, useContext } from 'react';
import { LuTrash2 } from "react-icons/lu";
import { LuSearch } from "react-icons/lu";
import ProjectContext from '@/context/project/ProjectContext';
import UxContext from '@/context/ux/UxContext';
import { shortenText } from '@/utils/textUtils';
import { fetchProjects, handleDeleteProject, handleProjectClick } from '@/utils/project/projectUtils';
import FileContext from '@/context/file/FileContext';

interface ProjectListPopoverProps {
  modalIsOpen?: boolean;
  refreshTrigger?: number;
  onProjectClick: (projectId: string, projectName: string) => void;
  closePopover: () => void;
}

const ProjectListPopover: React.FC<ProjectListPopoverProps> = ({
  modalIsOpen,
  refreshTrigger = 0,
  onProjectClick,
  closePopover,
}) => {
  const { uxOpenPanel } = useContext(UxContext);

  const isOpen = modalIsOpen !== undefined ? modalIsOpen : (uxOpenPanel === 'projectList');

  const { projectContext, setProjectContext } = useContext(ProjectContext);
  const {   
    setFileTree,
    setSelectedFile
   } = useContext(FileContext);
  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects(page, search, setProjects, setTotalPages, setLoading, setError);
    }
  }, [isOpen, page, search, refreshTrigger]);
  
  return (
    <div className="bg-[#111827] text-white w-[460px] max-w-[460px] p-5" style={{border: "none"}}>
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-1">
          <span className="text-blue-500 mr-2">•</span>Select a Project
        </h2>
        <p className="text-gray-400 text-sm">Choose a project to open from your recent projects</p>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <LuSearch size={16} />
          </div>
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#131620] border border-[#2a2f3d] rounded-md py-2 pl-10 pr-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading && (
        <div className="mx-auto my-4 w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      )}
      {error && <p className="my-4 text-red-500">{error}</p>}

      {/* Projects list */}
      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#131620] border border-[#2a2f3d] rounded-md p-3 flex justify-between items-start hover:border-blue-500 transition-colors cursor-pointer"
          >
            <div 
              onClick={() => handleProjectClick(project.id, project.name, onProjectClick, closePopover)}
              className="flex-1"
            >
              <h3 className="font-medium">{project.name}</h3>
              <p className="text-xs text-gray-400">
                {shortenText(project.description || 'No description available')}
              </p>
              <p className="text-xs text-gray-400">
                Last updated: {new Date(project.last_updated).toLocaleString()}
              </p>
            </div>

            {/* Delete button */}
            <button 
              className="text-gray-400 hover:text-red-500 transition-colors" 
              aria-label="Delete project"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(
                  project.id,
                  page,
                  search,
                  setProjects,
                  setTotalPages,
                  setLoading,
                  setError,
                  projectContext,
                  setProjectContext,
                  setFileTree,
                  setSelectedFile
                );
              }}
            >
              <LuTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-1 mr-4">
        <button 
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="text-gray-400 disabled:opacity-50"
        >
          &lt;
        </button>
        <span className="text-xs text-gray-300">
          {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="text-gray-400 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>

      {/* Footer with pagination and buttons */}
      <div className="flex justify-center items-center mt-2 w-full">

        <div className="flex flex-row items-center gap-2">
          <button 
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
            onClick={closePopover}
          >
            Cancel
          </button>
          
          <button 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm transition-colors flex items-center"
            onClick={closePopover}
          >
            <span className="mr-1">Open Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectListPopover;
