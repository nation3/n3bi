const getEnvironmentVariable = (environmentVariable : string): string => {
    console.log('getEnvironmentVariable', environmentVariable)
    const variable = process.env[environmentVariable]
    if (!variable) {
        throw new Error(`Missing variable: "${environmentVariable}"`)
    } else {
        return variable
    }
}

export const config = {
    chain: getEnvironmentVariable('NEXT_PUBLIC_CHAIN')
}
console.log('config:', config)
