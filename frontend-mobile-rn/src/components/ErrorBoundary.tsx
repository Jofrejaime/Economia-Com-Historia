import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { appTheme } from "../constants/theme";
import { DevSettings } from "react-native";

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: any;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You can log the error to an external service here
    this.setState({ error, info });
    console.error("Uncaught error:", error, info);
  }

  handleReload = () => {
    // DevSettings.reload works in development
    try {
      DevSettings.reload();
    } catch (e) {
      // fallback: reset error state
      this.setState({ hasError: false, error: null, info: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Ocorreu um erro</Text>
          <Text style={styles.message}>{String(this.state.error?.message ?? "Erro desconhecido")}</Text>
          <Text style={styles.stack}>{this.state.info?.componentStack ?? ""}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReload}>
            <Text style={styles.buttonText}>Recarregar</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: appTheme.spacing.lg,
    backgroundColor: appTheme.colors.background,
    justifyContent: "center",
  },
  title: {
    fontFamily: "IBM_Plex_Sans",
    fontSize: 22,
    fontWeight: "700",
    color: appTheme.colors.primary,
    marginBottom: 12,
  },
  message: {
    fontFamily: "Source_Sans_3",
    fontSize: 16,
    color: appTheme.colors.textPrimary,
    marginBottom: 8,
  },
  stack: {
    fontFamily: "Source_Sans_3",
    fontSize: 12,
    color: appTheme.colors.textMuted,
    marginBottom: 20,
  },
  button: {
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    fontFamily: "Source_Sans_3",
    color: "white",
    fontWeight: "700",
  },
});

export default ErrorBoundary;
