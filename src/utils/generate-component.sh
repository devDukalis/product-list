#!/bin/bash

componentTitle=""
componentsPath="$PWD/src/components"

echo "START"

while true; do
    read -r -p "Enter component title: " componentTitle

    if [ -z "$componentTitle" ]; then
        echo "ERROR: component title cannot be empty!"

    elif [ ${#componentTitle} -lt 3 ]; then
        echo "ERROR: component title cannot contain less than 3 characters!"

    elif [ ${#componentTitle} -gt 30 ]; then
        echo "ERROR: component title cannot contain greater than 30 characters!"

    elif [[ ! ${componentTitle} =~ ^[A-Z]([a-z0-9]*[a-z])?$ ]]; then
        echo "ERROR: component title requires PascalCase!"

    else
        break
    fi
done

componentDirectory="${componentsPath}/${componentTitle^}"
echo "Component path: $componentDirectory"

while true; do

    if [ -d "$componentDirectory" ]; then
        echo "ERROR: component directory $componentDirectory already exists!"

        while true; do
            read -r -p "Enter a different component title: " componentTitle

            if [ -z "$componentTitle" ]; then
                echo "ERROR: component title cannot be empty!"

            elif [[ ! ${componentTitle} =~ ^[A-Z][a-zA-Z0-9]*$ ]]; then
                echo "ERROR: component title requires PascalCase!"

            elif [ ${#componentTitle} -lt 3 ]; then
                echo "ERROR: component title cannot contain less than 3 characters!"

            elif [ ${#componentTitle} -gt 30 ]; then
                echo "ERROR: component title cannot contain greater than 30 characters!"

            else
                componentDirectory="${componentsPath}/${componentTitle^}"
                break
            fi
        done

    else
        break
    fi
done

mkdir -p "$componentDirectory"

cd "$componentDirectory" || exit

while true; do
    echo "Choose an option: "
    echo "1. Function"
    echo "2. Function + CSS"
    echo "3. Function + CSS modules"
    echo "4. Class"
    echo "5. Class + CSS"
    echo "6. Class + CSS modules"

    read -r -p "Enter the number (1/6): " componentType

    case $componentType in
    # function
    1)
        touch "index.tsx"

        echo -e "export const ${componentTitle^} = () => {
  return <p className=\"test\">${componentTitle^}</p>;
};" >>index.tsx
        break
        ;;

    # function + css
    2)
        touch "index.tsx"
        echo -e "import \"./style.css\";

export const ${componentTitle^} = () => {
  return <p className=\"test\">${componentTitle^}</p>;
};" >>index.tsx

        touch "style.css"
        echo -e ".test {
  color: red;
}" >>style.css
        break
        ;;

    # function + css modules
    3)
        touch "index.tsx"
        echo -e "import classes from \"./style.module.css\";

export const ${componentTitle^} = () => {
  return <p className={classes.test}>${componentTitle^}</p>;
};" >>index.tsx

        touch "style.module.css"
        echo -e ".test {
  color: red;
}" >>style.module.css
        break
        ;;

    # class
    4)
        touch "index.tsx"
        echo -e "import { Component } from \"react\";

export class ${componentTitle^} extends Component {
  render() {
    return <p className=\"test\">${componentTitle^}</p>;
  }
}" >>index.tsx
        break
        ;;

    # class + css
    5)
        touch "index.tsx"
        echo -e "import { Component } from \"react\";

import \"./style.css\";

export class ${componentTitle^} extends Component {
  render() {
    return <p className=\"test\">${componentTitle^}</p>;
  }
}" >>index.tsx

        touch "style.css"
        echo -e ".test {
  color: red;
}" >>style.css
        break
        ;;

    # class + css modules
    6)
        touch "index.tsx"
        echo -e "import { Component } from \"react\";

import classes from \"./style.module.css\";

export class ${componentTitle^} extends Component {
  render() {
    return <p className={classes.test}>${componentTitle^}</p>;
  }
}" >>index.tsx

        touch "style.module.css"
        echo -e ".test {
  color: red;
}" >>style.module.css
        break
        ;;
    *)
        echo "ERROR: enter the correct number (1/6)"
        ;;
    esac
done

echo "DONE"
