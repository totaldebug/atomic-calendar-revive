#################
Development Cycle
#################

The below will provide a guide on how you should develop for this plugin to have your
code reviewed and accepted.

****************
Setup Repository
****************

* Fork the repo in `github <https://github.com/totaldebug/atomic-calendar-revive>`_
* Clone the project to your development machine (or follow the DevContainer instructions)

.. code-block:: bash

    git clone https://github.com/your-username/atomic-calendar-revive.git

*******************
Create Topic Branch
*******************

You should always work on a new topic branch for each feature / bug you are working on.
Also you must ensure that you have pulled the latest version from upstream see below.

Start by setting up an upstream remote, this will be used to pull the latest version
from the main repository:

.. code-block:: bash

      git remote add upstream https://github.com/totaldebug/atomic-calendar-revive


Checkout the beta branch and pull the latest upstream version:

.. code-block:: bash

      git checkout beta
      git fetch upstream
      git merge upstream/beta
      git push

Your fork should now be in sync with the main totaldebug repository.

********************
Install Dependencies
********************

From the cloned repository, run the command to install the requirements:

.. code-block:: bash

      yarn install

.. note::

   If you are using VSCode devcontainer this happens as part of the post steps.

************
Make changes
************

You are now ready to make changes to the code, all source code is in the ``src`` directory
there should be no need to change any other files.

*******
Testing
*******

There are no automated tests for this project, however it is expected that any
development work is tested against a HA Server with both CalDav and Google Calendar
attached, this ensures no adverse impact is added with the feature or bugfix.

To create the card run the command ``yarn run build`` this output into the ``dist`` folder,
this can then be uploaded to HA for testing.

**********
Versioning
**********

You dont need to worry about versioning, the release process takes care of that for you!

But in case you are curious this project follows `Semantic Versioning <http://semver.org>`_

**MAJOR.MINOR.PATCH**

In the context of semantic versioning, the following should apply:

* **Major** - A breaking change that requires user intervention, or a change to a
  default value.
* **Minor** - A change that does not require intervention, or adds additional
  functionality in a backwards compatible manner.
* **Patch** - A change that resolves a specific bug.

All changes are tracked in the `release notes <https://github.com/totaldebug/atomic-calendar-revive/releases>`_


**************
Commit Changes
**************

Once you are happy with the changes, these can be committed (I recommend using commitizen):


.. code-block:: bash

   git add .
   git cz

Then follow the prompts and select the relevant options. If this resolves a specific issue, be sure to enter
the issue number when prompted.


.. code-block:: bash

    git add .
    git commit -v -m "feat: Added new feature #100"

.. note::

    Commit messages MUST follow `conventional commits <https://www.conventionalcommits.org/en/v1.0.0/>`_
    this ensures clear commit messages within the repository. Without this your change will be rejected as it is required for release.

    Breaking changes are detected with ``!`` e.g. ``feat!: my breaking change``


*******************
Submit Pull Request
*******************

Once development & testing are completed a pull request can be created to the beta branch.

A member of the team will review the request, test and merge if appropriate.
