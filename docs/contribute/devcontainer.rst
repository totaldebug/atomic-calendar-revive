######################
VS Code - DevContainer
######################

The easiest way to get your development environment setup is by using VS Code
with Dev Containers, this utilises Docker containers to setup a development
environment that guarantees a match with all other developers, removing any
potential headaches from incompatibilities.

************
Requirements
************

* VS Code
* Docker
* Remote - Containers (VS Code extension)


*************
Configuration
*************

#. Copy the files inside ``.devcontainer``
#. Paste them in the same folder, renaming to remove the ``recommended-``
#. In most cases no other changes will be required with these files

.. note::
   Please ensure that the ``recommended-xxx`` files are not removed as this would remove
   them from the repository

When you open the repository with VS Code, a prompt to "Reopen in container" should
now appear. This will start the build of the development container with all components
and extensions pre-installed.

.. note::
   If you don't see the notification, open the command pallet and select
   ``Remote-Containers: Open Folder in Container``
